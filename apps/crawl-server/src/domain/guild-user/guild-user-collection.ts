import type {
  BroadcastGuildUserMessage,
  BroadcastGuildUserMessageData,
  BroadcastGuildUserUpdateMessage,
} from '@tk-crawler/biz-shared';
import { getAvailableGuildUser } from '../../services/guild-user';
import { GuildUserModel } from './guild-user-model';

export interface GuildUserCollectionContext {
  readonly orgId: string;
  readonly orgName: string;
}

export class GuildUserCollection {
  private _guildUsers: GuildUserModel[] = [];

  private _context: GuildUserCollectionContext;

  get validGuildUsers() {
    return this._guildUsers.filter(item => item.isValid);
  }

  get orgName() {
    return this._context.orgName;
  }

  constructor(
    data: BroadcastGuildUserMessageData[],
    context: GuildUserCollectionContext,
  ) {
    this._guildUsers = data.map(item => new GuildUserModel(item, this));
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
      return new GuildUserModel(item, this);
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
    const guildUser = new GuildUserModel(data, this);
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
