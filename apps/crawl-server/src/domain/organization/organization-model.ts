import type {
  Area,
  BroadcastGuildUserMessage,
  BroadcastGuildUserMessageData,
  BroadcastOrganizationMessageData,
  OrgAnchorSearchPolicies,
} from '@tk-crawler/biz-shared';
import type { GuildUserCollectionContext } from '../guild-user/guild-user-collection';
import { OrganizationStatus } from '@tk-crawler/biz-shared';
import { isArrayEqual } from '@tk-crawler/shared';
import dayjs from 'dayjs';
import { logger } from '../../infra/logger';
import { GuildUserCollection } from '../guild-user/guild-user-collection';
import { AreaRunner } from './area-runner';

export class OrganizationModel implements GuildUserCollectionContext {
  readonly id: string;
  private _name: string;
  private _membership_start_at: Date | string | null;
  private _membership_expire_at: Date | string | null;
  private _status: OrganizationStatus;
  private _areas: Area[];
  private _areaRunners: AreaRunner[];
  private _guildUserCollection: GuildUserCollection;

  private _anchor_search_policies: OrgAnchorSearchPolicies;

  get orgId() {
    return this.id;
  }

  get orgName() {
    return this._name;
  }

  get isValid() {
    return (
      this._status === OrganizationStatus.normal &&
      Boolean(this._membership_expire_at) &&
      dayjs(this._membership_expire_at).isAfter(new Date())
    );
  }

  get areas() {
    return this._areas;
  }

  get anchorSearchPolicies() {
    return this._anchor_search_policies;
  }

  get validGuildUsers() {
    return this._guildUserCollection.validGuildUsers;
  }

  // async handleAnchorMessage(message: BroadcastAnchorMessage) {
  //   if (!this.isValid) {
  //     return;
  //   }
  //   const { data } = message;
  //   await this._guildUserCollection.handleAnchorMessage(data);
  // }

  async handleGuildUserMessage(message: BroadcastGuildUserMessage) {
    await this._guildUserCollection.handleGuildUserMessage(message);
  }

  async destroy() {
    this._areaRunners.forEach(runner => runner.destroy());
    this._areaRunners = [];
    await this._guildUserCollection.destroy();
  }

  private async _handleGuildUsersChange(
    guild_users: BroadcastGuildUserMessageData[],
  ) {
    await this._guildUserCollection.handleGuildUsersChange(guild_users);
  }

  async handleOrganizationUpdate(
    data: Partial<BroadcastOrganizationMessageData> & {
      guild_users?: BroadcastGuildUserMessageData[];
    },
  ) {
    data.name !== undefined && (this._name = data.name);
    data.membership_start_at !== undefined &&
      (this._membership_start_at = data.membership_start_at);
    data.membership_expire_at !== undefined &&
      (this._membership_expire_at = data.membership_expire_at);
    data.status !== undefined && (this._status = data.status);
    data.ignore_commerce_anchor !== undefined &&
      (this._anchor_search_policies.ignore_commerce_anchor =
        data.ignore_commerce_anchor);
    data.highest_diamonds_limit !== undefined &&
      (this._anchor_search_policies.highest_diamonds_limit =
        data.highest_diamonds_limit);
    data.rank_league_limit !== undefined &&
      (this._anchor_search_policies.rank_league_limit = data.rank_league_limit);
    if (
      data.areas !== undefined &&
      !isArrayEqual(this._areas, data.areas, undefined, true)
    ) {
      const oldAreas = this._areas;
      this._areas = data.areas;
      const oldAreaRunnerMap = this._areaRunners.reduce(
        (acc, areaRunner) => {
          acc[areaRunner.area] = areaRunner;
          return acc;
        },
        {} as Record<string, AreaRunner>,
      );
      const newAreaRunnerList = this._areas.map(area => {
        const areaRunner = oldAreaRunnerMap[area];
        if (areaRunner) {
          delete oldAreaRunnerMap[area];
          return areaRunner;
        }
        return new AreaRunner(area, this);
      });
      this._areaRunners = newAreaRunnerList;
      logger.info(`[update area runner list]`, {
        oldAreas,
        areas: this._areaRunners.map(item => item.area),
      });
      Object.values(oldAreaRunnerMap).forEach(areaRunner =>
        areaRunner.destroy(),
      );
    }
    if (data.guild_users) {
      await this._handleGuildUsersChange(data.guild_users);
    }
  }

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
    this._anchor_search_policies = {
      ignore_commerce_anchor: data.ignore_commerce_anchor,
      highest_diamonds_limit: data.highest_diamonds_limit,
      rank_league_limit: data.rank_league_limit,
    };
    this._guildUserCollection = new GuildUserCollection(data.guild_users, this);
    this._areaRunners = data.areas.map(area => new AreaRunner(area, this));
  }
}
