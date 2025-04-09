import type {
  Area,
  BroadcastGuildUserMessageData,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';

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
}
