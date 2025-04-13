import type {
  BroadcastAnchorMessageData,
  BroadcastGuildUserMessage,
  BroadcastGuildUserMessageData,
  BroadcastGuildUserUpdateMessage,
} from '@tk-crawler/biz-shared';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { getAvailableGuildUser } from '../../services/guild-user';
import { GuildUserModel, isGuildUserValid } from './guild-user-model';

export class GuildUserCollection {
  private _guildUsers: GuildUserModel[] = [];

  constructor(data: BroadcastGuildUserMessageData[]) {
    this._guildUsers = data.map(item => new GuildUserModel(item));
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

  async handleAnchorMessage(data: BroadcastAnchorMessageData) {
    logger.trace(`handle anchor message:`, {
      data: beautifyJsonStringify(data),
    });
    // TODO: 更新主播信息
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
    } else if (data.status !== undefined && isGuildUserValid(data.status)) {
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
  }
}
