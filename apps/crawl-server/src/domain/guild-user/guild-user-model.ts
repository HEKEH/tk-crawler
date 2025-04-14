import type {
  Area,
  BroadcastAnchorMessageData,
  BroadcastGuildUserMessageData,
} from '@tk-crawler/biz-shared';
import type {
  AnchorCheckInfo,
  BatchCheckAnchorResponse,
} from '@tk-crawler/tk-requests';
import {
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import {
  batchCheckAnchors,
  CanUseInvitationType,
} from '@tk-crawler/tk-requests';
import { logger } from '../../infra/logger';
import {
  batchUpdateAnchorInviteCheck,
  recordAnchorCheckByOrg,
  updateGuildUserStatus,
} from '../../services';

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

  private _currentQueryPerHour: number = 0;
  private _currentQueryPerDay: number = 0;

  private _hasSystemError: boolean = false;
  private _systemErrorTimer: NodeJS.Timeout | null = null;

  get area() {
    return this._area;
  }

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
    return Boolean(
      !this._hasSystemError &&
        this._area &&
        VALID_GUILD_USER_STATUS_LIST.includes(this._status) &&
        this._cookie &&
        this._factionId &&
        this._currentQueryPerHour < this._maxQueryPerHour &&
        this._currentQueryPerDay < this._maxQueryPerDay,
    );
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

  private async _updateGuildUserStatus(status: TKGuildUserStatus) {
    this._status = status;
    logger.trace(`[guild-user] update status: ${this.id} ${status}`);
    await updateGuildUserStatus({
      id: this.id,
      status,
    });
  }

  private _encounterSystemError() {
    this._hasSystemError = true;
    this._systemErrorTimer = setTimeout(
      () => {
        this._hasSystemError = false; // 5 分钟之后恢复
      },
      1000 * 60 * 5,
    );
  }

  private async _batchUpdateAnchorInviteCheck(
    anchorInviteCheckData: AnchorCheckInfo[],
  ) {
    const checked_at = new Date();
    const getInviteType = (types: CanUseInvitationType[] | undefined) => {
      if (types?.includes(CanUseInvitationType.Elite)) {
        return CanUseInvitationType.Elite;
      }
      if (types?.includes(CanUseInvitationType.Regular)) {
        return CanUseInvitationType.Regular;
      }
      return null;
    };
    await batchUpdateAnchorInviteCheck(
      anchorInviteCheckData.map(item => {
        return {
          anchor_id: item.UserBaseInfo.UserID!,
          org_id: this._orgId,
          checked_by: this.id,
          checked_result: item.MultiAccountNotMeetBasicQualification === false,
          invite_type: getInviteType(item.CanUseInvitationType),
          checked_at,
          area: this._area!,
        };
      }),
    );
  }

  // TODO: 记录查询次数到redis
  private async _recordQuery() {}

  async checkAnchors(anchors: BroadcastAnchorMessageData[]): Promise<{
    success: boolean;
  }> {
    if (!this.isValid) {
      return {
        success: false,
      };
    }
    const queryParams = {
      displayIds: anchors.map(item => item.display_id),
      cookie: this._cookie!,
      factionId: this._factionId!.toString(),
    };
    let result: BatchCheckAnchorResponse;
    try {
      result = await batchCheckAnchors(queryParams);
    } catch (e) {
      logger.error(`[guild-user] check anchors error: ${this.id}`, e);
      // 系统错误直接退出
      this._encounterSystemError();
      return {
        success: false,
      };
    }
    if (result.status_code !== 0) {
      const status =
        result.BaseResp?.StatusCode === 4030004
          ? TKGuildUserStatus.COOKIE_EXPIRED
          : TKGuildUserStatus.ERROR;
      await this._updateGuildUserStatus(status);

      return {
        success: false,
      };
    }
    if (this._status !== TKGuildUserStatus.RUNNING) {
      await this._updateGuildUserStatus(TKGuildUserStatus.RUNNING);
    }
    const anchorInviteCheckData = (result.data!.AnchorList || []).filter(
      item => item.UserBaseInfo?.UserID,
    );
    if (!anchorInviteCheckData.length) {
      return {
        success: false,
      };
    }
    try {
      await this._batchUpdateAnchorInviteCheck(anchorInviteCheckData);
      await Promise.all([
        recordAnchorCheckByOrg({
          anchorIds: anchors.map(item => item.user_id),
          orgId: this._orgId,
        }),
        this._recordQuery(),
      ]);
    } catch (e) {
      logger.error(
        `[guild-user] batch update anchor invite check error: ${this.id}`,
        e,
      );
      return {
        success: false,
      };
    }
    return {
      success: true,
    };
  }

  async destroy() {
    if (this._systemErrorTimer) {
      clearTimeout(this._systemErrorTimer);
      this._systemErrorTimer = null;
    }
  }
}
