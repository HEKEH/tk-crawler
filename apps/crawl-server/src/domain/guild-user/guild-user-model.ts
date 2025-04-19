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
  CanUseInvitationType,
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { recordAnchorCheckCount } from '@tk-crawler/server-shared';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { batchCheckAnchors, getProfile } from '@tk-crawler/tk-requests';
import { logger } from '../../infra/logger';
import {
  batchUpdateAnchorInviteCheck,
  deleteAnchorById,
  // recordAnchorCheckByOrg,
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

  private _keepAliveTimer: NodeJS.Timeout | null = null;

  get username() {
    return this._username;
  }

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
    this._keepAlive();
  }

  get status() {
    return this._status;
  }

  get isValid() {
    return Boolean(
      !this._hasSystemError &&
        this._area &&
        VALID_GUILD_USER_STATUS_LIST.includes(this._status) &&
        this._cookie &&
        this._factionId,
    );
  }

  private async _keepAlive() {
    this._keepAliveTimer = setTimeout(
      async () => {
        logger.info(`[guild-user] keep alive: ${this.id} ${this._username}`);
        this._keepAlive();
        if (this.isValid) {
          try {
            await getProfile(
              { cookie: this._cookie!, factionId: this._factionId!.toString() },
              logger,
            );
          } catch (e) {
            logger.error(
              `[guild-user] keep alive error: ${this.id} ${this._username}`,
              e,
            );
          }
        }
      },
      Math.floor(1000 * 60 * (3 + Math.random() * 4)),
    ); // 3-7 分钟运行一次，保持cookie有效
  }

  get isQueryCountValid() {
    return (
      this._currentQueryPerHour < this._maxQueryPerHour &&
      this._currentQueryPerDay < this._maxQueryPerDay
    );
  }

  get currentQueryPerHour() {
    return this._currentQueryPerHour;
  }

  setCurrentQueryPerHour(value: number) {
    this._currentQueryPerHour = value;
  }

  get currentQueryPerDay() {
    return this._currentQueryPerDay;
  }

  setCurrentQueryPerDay(value: number) {
    this._currentQueryPerDay = value;
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
    logger.trace(
      `[guild-user] update status: ${this.id} ${this._username} ${status}`,
    );
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
    const getInviteType = (types: CanUseInvitationType[] | undefined) => {
      if (types?.includes(CanUseInvitationType.Elite)) {
        return CanUseInvitationType.Elite;
      }
      if (types?.includes(CanUseInvitationType.Regular)) {
        return CanUseInvitationType.Regular;
      }
      return null;
    };
    const data = anchorInviteCheckData
      .map(item => {
        return {
          anchor_id: item.UserBaseInfo.UserID!,
          org_id: this._orgId,
          checked_by: this.id,
          checked_result: item.MultiAccountNotMeetBasicQualification === false,
          invite_type: getInviteType(item.CanUseInvitationType),
          area: this._area!,
        };
      })
      .filter(item => item.anchor_id && item.anchor_id !== '0');
    if (!data.length) {
      return;
    }
    await batchUpdateAnchorInviteCheck(data);
  }

  private async _recordQueryByGuildUserCount() {
    await recordAnchorCheckCount(
      {
        org_id: this._orgId,
        guild_user_id: this.id,
      },
      logger,
    );
  }

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
      await this._recordQueryByGuildUserCount();
      logger.info(
        `[guild-user] batchCheckAnchors result: ${beautifyJsonStringify(result)}`,
      );
    } catch (e) {
      logger.error(
        `[guild-user] check anchors error: ${this.id} ${this._username}`,
        e,
      );
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
      item => item.UserBaseInfo?.UserID && item.UserBaseInfo.UserID !== '0',
    );
    await this._compareAnchors(anchors, anchorInviteCheckData);
    if (!anchorInviteCheckData.length) {
      return {
        success: false,
      };
    }
    try {
      await this._batchUpdateAnchorInviteCheck(anchorInviteCheckData);
      // await recordAnchorCheckByOrg({
      //   anchorIds: anchors.map(item => item.user_id),
      //   orgId: this._orgId,
      // });
    } catch (e) {
      logger.error(
        `[guild-user] batch update anchor invite check error: ${this.id} ${this._username}`,
        e,
      );
      this._encounterSystemError();
      return {
        success: false,
      };
    }
    return {
      success: true,
    };
  }

  /** 处理前后id不一致的情况，这种情况很罕见，但确实存在，怀疑是tiktok数据异常 */
  private async _compareAnchors(
    anchors: BroadcastAnchorMessageData[],
    anchorInviteCheckData: AnchorCheckInfo[],
  ) {
    const anchorDisplayIdToIdMap = anchors.reduce(
      (acc, item) => {
        acc[item.display_id] = item.user_id;
        return acc;
      },
      {} as Record<string, string>,
    );
    for (let i = anchorInviteCheckData.length - 1; i >= 0; i--) {
      const userInfo = anchorInviteCheckData[i].UserBaseInfo;
      const displayId = userInfo.DisplayID!;
      const anchorId = userInfo.UserID!;
      const anchorIdInAnchorTable = anchorDisplayIdToIdMap[displayId];
      if (!anchorIdInAnchorTable) {
        logger.warn(`[guild-user] anchor not found: ${displayId}`);
        // 表中不存在这个display_id
        anchorInviteCheckData.splice(i, 1);
        continue;
      }
      // id不一致，删除表中的异常anchor
      if (anchorId !== anchorIdInAnchorTable) {
        logger.warn(
          `[guild-user] anchor id not match: ${displayId} ${anchorId}(in batchCheckAnchors) ${anchorIdInAnchorTable}(in table)`,
        );
        await deleteAnchorById({ user_id: anchorIdInAnchorTable });
        anchorInviteCheckData.splice(i, 1);
      }
    }
  }

  async destroy() {
    if (this._systemErrorTimer) {
      clearTimeout(this._systemErrorTimer);
      this._systemErrorTimer = null;
    }
    if (this._keepAliveTimer) {
      clearTimeout(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
  }
}
