import {
  type Area,
  type BroadcastGuildUserMessage,
  type BroadcastGuildUserMessageData,
  type BroadcastGuildUserUpdateMessage,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';
import { getAnchorCheckCount } from '@tk-crawler/server-shared';
import { getMinArrayValueIndex } from '@tk-crawler/shared';
import { ANCHORS_CHECK_NUMBER } from '../../constants';
import { logger } from '../../infra/logger';
import { searchAnchorsNeedCheck } from '../../services';
import { getAvailableGuildUser } from '../../services/guild-user';
import { GuildUserModel } from './guild-user-model';

export interface GuildUserCollectionContext {
  readonly areas: Area[];
  readonly orgId: string;
  readonly isValid: boolean;
}

// 每次的主播检测数量

export class GuildUserCollection {
  private _guildUsers: GuildUserModel[] = [];

  private _context: GuildUserCollectionContext;

  private _checkTimer: NodeJS.Timeout | null = null;

  // private _queuedAnchorIdsSet: Set<string> = new Set();

  private get checkInterval() {
    const guildUsersCount = this._guildUsers.filter(
      item => item.isValid,
    ).length;
    const maxInterval = 1000 * 60 * 1;
    const minInterval = (1000 * 60) / 2;
    if (guildUsersCount === 0) {
      return maxInterval;
    }
    if (guildUsersCount >= 50) {
      return minInterval;
    }
    return (
      maxInterval -
      ((maxInterval - minInterval) * guildUsersCount) / 50 +
      (10 * Math.random() - 5)
    );
  }

  private async _updateGuildUsersQueryRecord(guildUsers: GuildUserModel[]) {
    const resp = await getAnchorCheckCount(
      guildUsers.map(item => ({
        org_id: this._context.orgId,
        guild_user_id: item.id,
      })),
      logger,
    );
    resp.forEach((item, index) => {
      const guildUser = guildUsers[index];
      guildUser.setCurrentQueryPerHour(item.query_per_hour);
      guildUser.setCurrentQueryPerDay(item.query_per_day);
    });
  }

  /** 选择最合适的账号去检测当前area */
  private async _chooseBestGuildUser(
    area: Area,
    excludeGuildUserIds?: Set<string>,
  ): Promise<GuildUserModel | null> {
    let guildUsers = this._guildUsers.filter(
      item =>
        item.area === area &&
        item.isValid &&
        (!excludeGuildUserIds || !excludeGuildUserIds.has(item.id)),
    );
    if (guildUsers.length === 0) {
      return null;
    }
    await this._updateGuildUsersQueryRecord(guildUsers);
    guildUsers = guildUsers.filter(item => item.isQueryCountValid);
    if (guildUsers.length === 0) {
      return null;
    }
    // 如果存在等待中的账号，则优先选择等待中的账号
    if (guildUsers.find(item => item.status === TKGuildUserStatus.WAITING)) {
      guildUsers = guildUsers.filter(
        item => item.status === TKGuildUserStatus.WAITING,
      );
    }
    // 选择当前查询次数最少的账号
    const minIndex = getMinArrayValueIndex(
      guildUsers,
      item => item.currentQueryPerDay,
    );
    const result = guildUsers[minIndex] || null;
    if (result) {
      logger.trace('choose best guild user', result.username);
    }
    return result;
  }

  constructor(
    data: BroadcastGuildUserMessageData[],
    context: GuildUserCollectionContext,
  ) {
    this._guildUsers = data.map(item => new GuildUserModel(item));
    this._context = context;
    this._intervalCheck();
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

  // private async _shouldAnchorAddToQueue(data: BroadcastAnchorMessageData) {
  //   const { region } = data;
  //   const area = getAreaByRegion(region);
  //   if (!(area && this._context.areas.includes(area))) {
  //     return false;
  //   }
  //   const guildUserOfArea = this._guildUsers.find(
  //     item => item.isValid && item.area === area,
  //   );
  //   if (!guildUserOfArea) {
  //     return false;
  //   }
  //   if (this._queuedAnchorIdsSet.has(data.user_id)) {
  //     return false;
  //   }
  //   return true;
  //   // const isCheckedRecently = await isAnchorRecentlyCheckedByOrg({
  //   //   anchorId: data.user_id,
  //   //   orgId: this._context.orgId,
  //   // });
  //   // return !isCheckedRecently;
  // }

  // async handleAnchorMessage(data: BroadcastAnchorMessageData) {
  //   logger.trace(`guild user collection handle anchor message:`, {
  //     data,
  //   });
  //   if (!(await this._shouldAnchorAddToQueue(data))) {
  //     return;
  //   }
  //   this._queuedAnchorIdsSet.add(data.user_id);
  //   const area = getAreaByRegion(data.region)!;
  //   if (!this._areaAnchorsMap[area]) {
  //     this._areaAnchorsMap[area] = [];
  //   }
  //   this._areaAnchorsMap[area].push(data);
  //   if (this._areaAnchorsMap[area].length < ANCHORS_CHECK_NUMBER) {
  //     return;
  //   }
  //   const batchAnchorIds = this._areaAnchorsMap[area].map(item => item.user_id);
  //   // 再检测一次，避免重复检测
  //   const batchIsAnchorRecentlyChecked =
  //     await batchIsAnchorRecentlyCheckedByOrg({
  //       anchorIds: batchAnchorIds,
  //       orgId: this._context.orgId,
  //     });

  //   const notNeedCheckAnchorIds = batchAnchorIds.filter(
  //     anchorId => batchIsAnchorRecentlyChecked[anchorId],
  //   );
  //   if (notNeedCheckAnchorIds.length) {
  //     notNeedCheckAnchorIds.forEach(anchorId =>
  //       this._queuedAnchorIdsSet.delete(anchorId),
  //     );
  //     this._areaAnchorsMap[area] = this._areaAnchorsMap[area].filter(
  //       item => !notNeedCheckAnchorIds.includes(item.user_id),
  //     );
  //     if (this._areaAnchorsMap[area].length < ANCHORS_CHECK_NUMBER) {
  //       return;
  //     }
  //   }
  //   const anchorsToCheck = this._areaAnchorsMap[area].splice(
  //     0,
  //     ANCHORS_CHECK_NUMBER,
  //   );
  //   logger.trace('anchors to check', anchorsToCheck);
  //   let checkSuccess = false;
  //   while (!checkSuccess) {
  //     const guildUser = await this._chooseBestGuildUser(area);
  //     // 没有可用的账号，则退出
  //     if (!guildUser) {
  //       break;
  //     }
  //     const { success } = await guildUser.checkAnchors(anchorsToCheck);
  //     checkSuccess = success; // 不成功则换下一个账号
  //   }
  //   if (!checkSuccess) {
  //     // 如果一直不成功，则将主播重新加入队列
  //     this._areaAnchorsMap[area].unshift(...anchorsToCheck);
  //   } else {
  //     // 如果成功，则将主播从队列中删除
  //     anchorsToCheck.forEach(anchor =>
  //       this._queuedAnchorIdsSet.delete(anchor.user_id),
  //     );
  //   }
  // }

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

  private async _checkAnchorsOfArea(area: Area) {
    logger.info(`[guild-user] check anchors of area: ${area}`);
    const anchors = await searchAnchorsNeedCheck({
      area,
      org_id: this._context.orgId,
    });
    if (anchors.length < ANCHORS_CHECK_NUMBER) {
      return;
    }
    let checkSuccess = false;
    const excludeGuildUserIds = new Set<string>();
    while (!checkSuccess) {
      const guildUser = await this._chooseBestGuildUser(
        area,
        excludeGuildUserIds,
      );
      if (!guildUser) {
        break;
      }
      excludeGuildUserIds.add(guildUser.id);
      const { success } = await guildUser.checkAnchors(anchors);
      checkSuccess = success;
    }
  }

  private async _batchCheckAnchors() {
    if (!this._context.isValid) {
      return;
    }
    for (const area of this._context.areas) {
      await this._checkAnchorsOfArea(area);
    }
  }

  private async _intervalCheck() {
    this._checkTimer = setTimeout(async () => {
      logger.info(`[guild-user] check: ${this._context.orgId}`);
      this._intervalCheck();
      await this._batchCheckAnchors();
    }, this.checkInterval);
  }

  async destroy() {
    await Promise.all(this._guildUsers.map(guildUser => guildUser.destroy()));
    this._guildUsers = [];
    if (this._checkTimer) {
      clearTimeout(this._checkTimer);
      this._checkTimer = null;
    }
    // this._queuedAnchorIdsSet.clear();
  }
}
