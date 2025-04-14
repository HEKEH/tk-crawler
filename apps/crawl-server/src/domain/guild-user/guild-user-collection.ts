import {
  type Area,
  type BroadcastAnchorMessageData,
  type BroadcastGuildUserMessage,
  type BroadcastGuildUserMessageData,
  type BroadcastGuildUserUpdateMessage,
  getAreaByRegion,
} from '@tk-crawler/biz-shared';
import { logger } from '../../infra/logger';
import { batchIsAnchorRecentlyCheckedByOrg } from '../../services';
import { getAvailableGuildUser } from '../../services/guild-user';
import { GuildUserModel } from './guild-user-model';

export interface GuildUserCollectionContext {
  readonly areas: Area[];
  readonly orgId: string;
}

// 每次的主播检测数量
const ANCHORS_CHECK_NUMBER = 30;

export class GuildUserCollection {
  private _guildUsers: GuildUserModel[] = [];

  private _context: GuildUserCollectionContext;
  private _areaAnchorsMap: Partial<Record<Area, BroadcastAnchorMessageData[]>> =
    {};

  private _queuedAnchorIdsSet: Set<string> = new Set();

  /** 选择最合适的账号去检测当前area */
  private async _chooseBestGuildUser(
    area: Area,
  ): Promise<GuildUserModel | null> {
    const guildUsers = this._guildUsers.filter(
      item => item.isValid && item.area === area,
    );
    if (guildUsers.length === 0) {
      return null;
    }
    // TODO: 选择合适的账号去检测
    return null;
  }

  constructor(
    data: BroadcastGuildUserMessageData[],
    context: GuildUserCollectionContext,
  ) {
    this._guildUsers = data.map(item => new GuildUserModel(item));
    this._context = context;
  }

  async handleGuildUsersChange(guild_users: BroadcastGuildUserMessageData[]) {
    const oldGuildUserMap = this._guildUsers.reduce(
      (acc, guildUser) => {
        acc[guildUser.id] = guildUser;
        return acc;
      },
      {} as Record<string, GuildUserModel>,
    );
    const newGuildUserList = guild_users.map(item => {
      const guildUser = oldGuildUserMap[item.id];
      if (guildUser) {
        guildUser.handleUpdate(item);
        delete oldGuildUserMap[item.id];
        return guildUser;
      }
      return new GuildUserModel(item);
    });
    this._guildUsers = newGuildUserList;
    await Promise.all(
      Object.values(oldGuildUserMap).map(guildUser => guildUser.destroy()),
    );
  }

  async handleGuildUserMessage(message: BroadcastGuildUserMessage) {
    const { type, data } = message;
    switch (type) {
      case 'update':
        await this._updateGuildUser(data);
        break;
      case 'create':
        this._createGuildUser(data);
        break;
      case 'delete':
        await this._deleteGuildUser(data);
        break;
      default:
        throw new Error(`unknown guild user message type: ${type}`);
    }
  }

  private async _shouldAnchorAddToQueue(data: BroadcastAnchorMessageData) {
    const { region } = data;
    const area = getAreaByRegion(region);
    if (!(area && this._context.areas.includes(area))) {
      return false;
    }
    const guildUserOfArea = this._guildUsers.find(
      item => item.isValid && item.area === area,
    );
    if (!guildUserOfArea) {
      return false;
    }
    if (this._queuedAnchorIdsSet.has(data.user_id)) {
      return false;
    }
    return true;
    // const isCheckedRecently = await isAnchorRecentlyCheckedByOrg({
    //   anchorId: data.user_id,
    //   orgId: this._context.orgId,
    // });
    // return !isCheckedRecently;
  }

  async handleAnchorMessage(data: BroadcastAnchorMessageData) {
    logger.trace(`guild user collection handle anchor message:`, {
      data,
    });
    if (!(await this._shouldAnchorAddToQueue(data))) {
      return;
    }
    this._queuedAnchorIdsSet.add(data.user_id);
    const area = getAreaByRegion(data.region)!;
    if (!this._areaAnchorsMap[area]) {
      this._areaAnchorsMap[area] = [];
    }
    this._areaAnchorsMap[area].push(data);
    if (this._areaAnchorsMap[area].length < ANCHORS_CHECK_NUMBER) {
      return;
    }
    const batchAnchorIds = this._areaAnchorsMap[area].map(item => item.user_id);
    // 再检测一次，避免重复检测
    const batchIsAnchorRecentlyChecked =
      await batchIsAnchorRecentlyCheckedByOrg({
        anchorIds: batchAnchorIds,
        orgId: this._context.orgId,
      });

    const notNeedCheckAnchorIds = batchAnchorIds.filter(
      anchorId => batchIsAnchorRecentlyChecked[anchorId],
    );
    if (notNeedCheckAnchorIds.length) {
      notNeedCheckAnchorIds.forEach(anchorId =>
        this._queuedAnchorIdsSet.delete(anchorId),
      );
      this._areaAnchorsMap[area] = this._areaAnchorsMap[area].filter(
        item => !notNeedCheckAnchorIds.includes(item.user_id),
      );
      if (this._areaAnchorsMap[area].length < ANCHORS_CHECK_NUMBER) {
        return;
      }
    }
    const anchorsToCheck = this._areaAnchorsMap[area].splice(
      0,
      ANCHORS_CHECK_NUMBER,
    );
    logger.trace('anchors to check', anchorsToCheck);
    let checkSuccess = false;
    while (!checkSuccess) {
      const guildUser = await this._chooseBestGuildUser(area);
      // 没有可用的账号，则退出
      if (!guildUser) {
        break;
      }
      const { success } = await guildUser.checkAnchors(anchorsToCheck);
      checkSuccess = success; // 不成功则换下一个账号
    }
    if (!checkSuccess) {
      // 如果一直不成功，则将主播重新加入队列
      this._areaAnchorsMap[area].unshift(...anchorsToCheck);
    } else {
      // 如果成功，则将主播从队列中删除
      anchorsToCheck.forEach(anchor =>
        this._queuedAnchorIdsSet.delete(anchor.user_id),
      );
    }
  }

  private async _updateGuildUser(
    data: BroadcastGuildUserUpdateMessage['data'],
  ) {
    const guildUser = this._guildUsers.find(item => item.id === data.id);
    if (guildUser) {
      guildUser.handleUpdate(data);
      if (!guildUser.isValid) {
        await this._deleteGuildUser({ ids: [guildUser.id] });
      }
    } else {
      const { id, org_id } = data;
      const guildUserData = await getAvailableGuildUser({
        id,
        org_id,
      });
      if (guildUserData.data) {
        this._createGuildUser(guildUserData.data);
      }
    }
  }

  // private _updateAreaGuildUsersMap() {
  //   const validGuildUsers = this._guildUsers.filter(item => item.isValid);
  //   this._areaGuildUsersMap = validGuildUsers.reduce(
  //     (acc, guildUser) => {
  //       const area = guildUser.area!;
  //       if (!acc[area]) {
  //         acc[area] = [];
  //       }
  //       acc[area].push(guildUser);
  //       return acc;
  //     },
  //     {} as Partial<Record<Area, GuildUserModel[]>>,
  //   );
  // }

  private _createGuildUser(data: BroadcastGuildUserMessageData) {
    const guildUser = new GuildUserModel(data);
    this._guildUsers.push(guildUser);
    return guildUser;
  }

  private async _deleteGuildUser(data: { ids: string[] }) {
    const set = new Set(data.ids);
    const guildUsersToDelete = this._guildUsers.filter(item =>
      set.has(item.id),
    );
    await Promise.all(guildUsersToDelete.map(guildUser => guildUser.destroy()));
    this._guildUsers = this._guildUsers.filter(item => !set.has(item.id));
  }

  async destroy() {
    await Promise.all(this._guildUsers.map(guildUser => guildUser.destroy()));
    this._guildUsers = [];
    this._areaAnchorsMap = {};
    this._queuedAnchorIdsSet.clear();
  }
}
