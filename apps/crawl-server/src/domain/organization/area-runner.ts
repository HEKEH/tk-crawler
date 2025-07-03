import type {
  Area,
  BroadcastAnchorMessageData,
  OrgAnchorSearchPolicies,
} from '@tk-crawler/biz-shared';
import type { GuildUserModel } from '../guild-user/guild-user-model';
import { TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { getAnchorCheckCount } from '@tk-crawler/server-shared';
import { getMinArrayValueIndex, getRandomInt } from '@tk-crawler/shared';
import { ANCHORS_CHECK_NUMBER } from '../../constants';
import { logger } from '../../infra/logger';
import { searchAnchorsNeedCheck } from '../../services';
import { searchAnchorsTaskQueue } from './search-anchors-task-queue';

export interface AreaRunnerContext {
  readonly validGuildUsers: GuildUserModel[];
  readonly orgId: string;
  readonly orgName: string;
  readonly isValid: boolean;
  readonly anchorSearchPolicies: OrgAnchorSearchPolicies;
}

// 每次的主播搜索数量
const ANCHORS_SEARCH_NUMBER_EACH_TIME = 300;

export class AreaRunner {
  private _area: Area;
  private _context: AreaRunnerContext;

  private _anchorsSearchCache: BroadcastAnchorMessageData[] = [];

  private _checkTimer: NodeJS.Timeout | null = null;

  get area() {
    return this._area;
  }

  constructor(area: Area, context: AreaRunnerContext) {
    this._area = area;
    this._context = context;
    this._intervalCheck();
  }

  private get validGuildUsers() {
    return this._context.validGuildUsers.filter(
      item => item.area === this._area,
    );
  }

  private get checkInterval() {
    const guildUsersCount = this.validGuildUsers.length;
    const maxInterval = 1000 * 60 * 2; // 2min
    const minInterval = (1000 * 60) / 4; // 15s

    if (guildUsersCount === 0) {
      return maxInterval;
    }
    if (guildUsersCount >= 30) {
      return minInterval;
    }

    // 使用指数函数：y = a * e^(-bx) + c
    const a = maxInterval - minInterval;
    const b = 0.05; // 控制衰减速度
    const c = minInterval;

    return Math.ceil(
      a * Math.exp(-b * guildUsersCount) + c + (10 * Math.random() - 5),
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
    excludeGuildUserIds?: Set<string>,
  ): Promise<GuildUserModel | null> {
    let guildUsers = this.validGuildUsers.filter(
      item => !excludeGuildUserIds || !excludeGuildUserIds.has(item.id),
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
      logger.info('choose best guild user', result.username);
    }
    return result;
  }

  private async _runCheckAnchors() {
    logger.info(
      `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] check anchors of area: ${this._area}`,
    );
    try {
      const ValidGuildUsers = this.validGuildUsers;
      if (!ValidGuildUsers.length) {
        logger.info(
          `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] [area: ${this._area}] no valid guild user to check anchors`,
        );
        return;
      }
      if (this._anchorsSearchCache.length < ANCHORS_CHECK_NUMBER) {
        const now = Date.now();
        const onlyNotChecked = Math.random() < 0.5; // 随机决定是否只搜索未检测过的账号
        let anchors = await searchAnchorsTaskQueue.addTask(() =>
          searchAnchorsNeedCheck({
            area: this._area,
            take:
              ANCHORS_SEARCH_NUMBER_EACH_TIME +
              getRandomInt(-2, 8) * ANCHORS_CHECK_NUMBER, // 随机错开
            org_id: this._context.orgId,
            org_name: this._context.orgName,
            anchor_search_policies: this._context.anchorSearchPolicies,
            only_not_checked: onlyNotChecked,
          }),
        );
        logger.info(
          `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] [area: ${this._area}] searchAnchorsTaskQueue add task cost: ${Date.now() - now}ms`,
        );
        if (this._anchorsSearchCache.length) {
          const anchorsCacheSet = new Set(
            this._anchorsSearchCache.map(item => item.user_id),
          );
          anchors = anchors.filter(item => !anchorsCacheSet.has(item.user_id));
        }
        this._anchorsSearchCache.push(...anchors);
      }
    } catch (error) {
      logger.error(
        `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] [area: ${this._area}] check anchors error:`,
        {
          error,
        },
      );
      return;
    }
    if (this._anchorsSearchCache.length < ANCHORS_CHECK_NUMBER) {
      return;
    }
    const anchorsToCheck = this._anchorsSearchCache.slice(
      0,
      ANCHORS_CHECK_NUMBER,
    );
    let checkSuccess = false;
    const excludeGuildUserIds = new Set<string>();
    while (!checkSuccess) {
      const guildUser = await this._chooseBestGuildUser(excludeGuildUserIds);
      if (!guildUser) {
        logger.info(
          `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] [area: ${this._area}] no guild user to check anchors`,
        );
        break;
      }
      excludeGuildUserIds.add(guildUser.id);
      logger.info(
        `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] [area: ${this._area}] choose the guild user: [name: ${guildUser.username}] [id: ${guildUser.id}]`,
      );
      const { success } = await guildUser.checkAnchors(anchorsToCheck);
      checkSuccess = success;
    }
    if (checkSuccess) {
      this._anchorsSearchCache =
        this._anchorsSearchCache.slice(ANCHORS_CHECK_NUMBER);
    }
  }

  private _isChecking = false;

  private async _batchCheckAnchors() {
    if (!this._context.isValid) {
      return;
    }
    if (this._isChecking) {
      return;
    }
    this._isChecking = true;
    try {
      await this._runCheckAnchors();
    } catch (error) {
      logger.error(
        `[guild-user] [orgName: ${this._context.orgName}] [orgId: ${this._context.orgId}] [area: ${this._area}] check anchors error:`,
        {
          error,
        },
      );
    } finally {
      this._isChecking = false;
    }
  }

  private _intervalCheck() {
    this._checkTimer = setTimeout(async () => {
      logger.info(`[guild-user] check:`, {
        orgId: this._context.orgId,
        orgName: this._context.orgName,
      });
      this._intervalCheck();
      await this._batchCheckAnchors();
    }, this.checkInterval);
  }

  destroy() {
    if (this._checkTimer) {
      clearTimeout(this._checkTimer);
      this._checkTimer = null;
    }
    this._anchorsSearchCache = [];
  }
}
