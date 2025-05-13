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
  deleteAnchorByDisplayIds,
  deleteAnchorById,
  // recordAnchorCheckByOrg,
  updateGuildUserStatus,
} from '../../services';

export interface GuildUserModelContext {
  readonly orgName: string;
}

export class GuildUserModel {
  readonly id: string;

  private _context: GuildUserModelContext;

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

  private _hasRequestError: boolean = false;
  private _systemRequestTimer: NodeJS.Timeout | null = null;

  private _keepAliveTimer: NodeJS.Timeout | null = null;

  get username() {
    return this._username;
  }

  get area() {
    return this._area;
  }

  constructor(
    data: BroadcastGuildUserMessageData,
    context: GuildUserModelContext,
  ) {
    this.id = data.id;
    this._username = data.username;
    this._orgId = data.org_id;
    this._status = data.status;
    this._area = data.area;
    this._maxQueryPerHour = data.max_query_per_hour;
    this._maxQueryPerDay = data.max_query_per_day;
    this._cookie = data.cookie;
    this._factionId = data.faction_id;
    this._context = context;
    this._keepAlive();
  }

  get status() {
    return this._status;
  }

  get isValid() {
    return Boolean(
      !this._hasRequestError &&
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
    this._status = await updateGuildUserStatus({
      id: this.id,
      status,
    });
    logger.info(`[guild-user] update status:`, {
      id: this.id,
      username: this._username,
      updateStatus: status,
      currentStatus: this._status,
    });
  }

  private _encounterRequestError(stopMinutes: number = 5) {
    this._hasRequestError = true;
    this._systemRequestTimer = setTimeout(
      () => {
        this._hasRequestError = false; // 5 分钟之后恢复
      },
      1000 * 60 * stopMinutes,
    );
  }

  private async _batchUpdateAnchorInviteCheck(
    anchorInviteCheckData: AnchorCheckInfo[],
  ) {
    logger.info(
      `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._orgId}] [area: ${this._area}] batch update anchor invite check`,
    );
    logger.trace(beautifyJsonStringify(anchorInviteCheckData));
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
      .filter(
        item => item.UserBaseInfo.UserID && item.UserBaseInfo.UserID !== '0',
      )
      .map(item => {
        return {
          anchor_id: item.UserBaseInfo.UserID!,
          org_id: this._orgId,
          checked_by: this.id,
          checked_result: item.MultiAccountNotMeetBasicQualification === false,
          invite_type: getInviteType(item.CanUseInvitationType),
          area: this._area!,
        };
      });
    if (!data.length) {
      logger.info(
        `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._orgId}] [area: ${this._area}] no anchor invite check data`,
      );
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
    logger.info(
      `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._orgId}] [area: ${this._area}] check anchors`,
    );
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
    } catch (e) {
      logger.error(
        `[guild-user] check anchors error: user_id: ${this.id} username: ${this._username}`,
        e,
      );
      // 系统错误直接退出
      this._encounterRequestError();
      return {
        success: false,
      };
    }
    if (result.status_code !== 0) {
      logger.error(
        `[guild-user] check anchors business error: ${this.id} ${this._username}`,
        beautifyJsonStringify(result),
      );
      const status =
        result.BaseResp?.StatusCode === 4030004
          ? TKGuildUserStatus.COOKIE_EXPIRED
          : TKGuildUserStatus.WARNING; // TODO: 需要优化，根据code来判断到到底是error还是warning，目前暂时都认为是warning
      if (status === TKGuildUserStatus.WARNING) {
        this._encounterRequestError(); // 暂停一阵
      }
      await this._updateGuildUserStatus(status);

      return {
        success: false,
      };
    }
    logger.info(
      `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._orgId}] [area: ${this._area}] batchCheckAnchors result: ${beautifyJsonStringify(result)}`,
    );
    if (this._status !== TKGuildUserStatus.RUNNING) {
      await this._updateGuildUserStatus(TKGuildUserStatus.RUNNING);
    }
    const abnormalAnchors = (result.data!.AnchorList || []).filter(
      item => !item.UserBaseInfo?.UserID || item.UserBaseInfo.UserID === '0',
    );
    if (abnormalAnchors.length) {
      await this._deleteAbnormalAnchors(abnormalAnchors);
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
      this._encounterRequestError();
      return {
        success: false,
      };
    }
    return {
      success: true,
    };
  }

  private async _deleteAbnormalAnchors(anchors: AnchorCheckInfo[]) {
    const abnormalAnchorsDisplayIds = anchors.map(
      item => item.UserBaseInfo?.DisplayID,
    );
    await deleteAnchorByDisplayIds({
      display_ids: abnormalAnchorsDisplayIds,
    });
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
    if (this._systemRequestTimer) {
      clearTimeout(this._systemRequestTimer);
      this._systemRequestTimer = null;
    }
    if (this._keepAliveTimer) {
      clearTimeout(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
  }
}
