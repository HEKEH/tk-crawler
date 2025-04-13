import type {
  Area,
  BroadcastGuildUserMessageData,
  TKGuildUserStatus } from '@tk-crawler/biz-shared';
import {
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';

export function isGuildUserValid(status: TKGuildUserStatus): boolean {
  return VALID_GUILD_USER_STATUS_LIST.includes(status);
}

export class GuildUserModel {
  readonly id: string;
  private _username: string;
  private _orgId: string;
  private _status: TKGuildUserStatus;
  private _area: Area | null;
  private _maxQueryPerHour: number;
  private _maxQueryPerDay: number;
  private _cookie: string | null;
  private _factionId: number | null;
  constructor(data: BroadcastGuildUserMessageData) {
    this.id = data.id;
    this._username = data.username;
    this._orgId = data.org_id;
    this._status = data.status;
    this._area = data.area;
    this._maxQueryPerHour = data.max_query_per_hour;
    this._maxQueryPerDay = data.max_query_per_day;
    this._cookie = data.cookie;
    this._factionId = data.faction_id;
  }

  get isValid() {
    return isGuildUserValid(this._status);
  }

  handleUpdate(data: Partial<BroadcastGuildUserMessageData>) {
    data.username !== undefined && (this._username = data.username);
    data.org_id !== undefined && (this._orgId = data.org_id);
    data.status !== undefined && (this._status = data.status);
    data.area !== undefined && (this._area = data.area);
    data.max_query_per_hour !== undefined &&
      (this._maxQueryPerHour = data.max_query_per_hour);
    data.max_query_per_day !== undefined &&
      (this._maxQueryPerDay = data.max_query_per_day);
    data.cookie !== undefined && (this._cookie = data.cookie);
    data.faction_id !== undefined && (this._factionId = data.faction_id);
  }

  async destroy() {}
}
