import type {
  Area,
  BroadcastGuildUserMessageData,
  BroadcastOrganizationMessageData,
  OrganizationStatus,
} from '@tk-crawler/biz-shared';
import { GuildUserCollection } from '../guild-user/guild-user-collection';

export class OrganizationModel {
  readonly id: string;
  private _name: string;
  private _membership_start_at: Date | null;
  private _membership_expire_at: Date | null;
  private _status: OrganizationStatus;
  private _areas: Area[];
  private _guildUserCollection: GuildUserCollection;

  constructor(
    data: BroadcastOrganizationMessageData & {
      guild_users: BroadcastGuildUserMessageData[];
    },
  ) {
    this.id = data.id;
    this._name = data.name;
    this._membership_start_at = data.membership_start_at;
    this._membership_expire_at = data.membership_expire_at;
    this._status = data.status;
    this._areas = data.areas;
    this._guildUserCollection = new GuildUserCollection(data.guild_users);
  }
}
