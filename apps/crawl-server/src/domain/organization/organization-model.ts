import type {
  Area,
  BroadcastGuildUserMessage,
  BroadcastGuildUserMessageData,
  BroadcastOrganizationMessageData,
  OrgAnchorSearchPolicies,
} from '@tk-crawler/biz-shared';
import type { GuildUserCollectionContext } from '../guild-user/guild-user-collection';
import { OrganizationStatus } from '@tk-crawler/biz-shared';
import dayjs from 'dayjs';
import { GuildUserCollection } from '../guild-user/guild-user-collection';

export class OrganizationModel implements GuildUserCollectionContext {
  readonly id: string;
  private _name: string;
  private _membership_start_at: Date | string | null;
  private _membership_expire_at: Date | string | null;
  private _status: OrganizationStatus;
  private _areas: Area[];
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
    data.areas !== undefined && (this._areas = data.areas);
    data.name !== undefined && (this._name = data.name);
    data.membership_start_at !== undefined &&
      (this._membership_start_at = data.membership_start_at);
    data.membership_expire_at !== undefined &&
      (this._membership_expire_at = data.membership_expire_at);
    data.status !== undefined && (this._status = data.status);
    data.ignore_commerce_anchor !== undefined &&
      (this._anchor_search_policies.ignore_commerce_anchor =
        data.ignore_commerce_anchor);
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
    };
    this._guildUserCollection = new GuildUserCollection(data.guild_users, this);
  }
}
