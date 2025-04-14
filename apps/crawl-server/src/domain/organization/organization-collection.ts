import type {
  Area,
  BroadcastAnchorMessage,
  BroadcastGuildUserMessage,
  BroadcastGuildUserMessageData,
  BroadcastOrganizationMessage,
  BroadcastOrganizationMessageData,
  BroadcastOrganizationUpdateMessage,
} from '@tk-crawler/biz-shared';
import type { RedisMessageBusCallback } from '@tk-crawler/database';
import {
  getAreaByRegion,
  ServerBroadcastMessageChannel,
} from '@tk-crawler/biz-shared';
import { redisMessageBus } from '@tk-crawler/database';
import { beautifyJsonStringify, isArrayEqual } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import {
  getAvailableOrganization,
  getAvailableOrganizationList,
} from '../../services';
import { OrganizationModel } from './organization-model';

export class OrganizationCollection {
  private _organizations: OrganizationModel[] = [];
  private _messageBusUnsubscribes: (() => Promise<void>)[] = [];
  private _areaOrganizationsMap: Partial<Record<Area, OrganizationModel[]>> =
    {};

  constructor() {}

  private _updateAreaOrganizationsMap() {
    this._areaOrganizationsMap = this._organizations.reduce(
      (acc, org) => {
        org.areas.forEach(area => {
          if (!acc[area]) {
            acc[area] = [];
          }
          acc[area].push(org);
        });
        return acc;
      },
      {} as Partial<Record<Area, OrganizationModel[]>>,
    );
    logger.trace(`update area organizations map:`, {
      areaOrganizationsMap: this._areaOrganizationsMap,
    });
  }

  async init() {
    const { list: rawOrganizations } = await getAvailableOrganizationList();
    logger.info(`init organization list:`, {
      data: beautifyJsonStringify(rawOrganizations),
    });
    this._organizations = rawOrganizations.map(
      item => new OrganizationModel(item),
    );
    this._updateAreaOrganizationsMap();
    await Promise.all([
      this._subscribeMessageBus(
        ServerBroadcastMessageChannel.OrganizationMessage,
        (message: BroadcastOrganizationMessage) => {
          this._handleOrganizationMessage(message);
        },
      ),
      this._subscribeMessageBus(
        ServerBroadcastMessageChannel.GuildUserMessage,
        (message: BroadcastGuildUserMessage) => {
          this._handleGuildUserMessage(message);
        },
      ),
      this._subscribeMessageBus(
        ServerBroadcastMessageChannel.AnchorMessage,
        (message: BroadcastAnchorMessage) => {
          this._handleAnchorMessage(message);
        },
      ),
    ]);
  }

  private async _subscribeMessageBus(
    channel: ServerBroadcastMessageChannel,
    callback: RedisMessageBusCallback,
  ) {
    const { unsubscribe } = await redisMessageBus.subscribe(channel, callback);
    this._messageBusUnsubscribes.push(unsubscribe);
  }

  private async _unsubscribeMessageBus() {
    await Promise.all(
      this._messageBusUnsubscribes.map(unsubscribe => unsubscribe()),
    );
    this._messageBusUnsubscribes = [];
  }

  async update() {
    const { list: rawOrganizations } = await getAvailableOrganizationList();
    logger.info(`update organization list:`, {
      data: beautifyJsonStringify(rawOrganizations),
    });
    const oldOrgMap = this._organizations.reduce(
      (acc, org) => {
        acc[org.id] = org;
        return acc;
      },
      {} as Record<string, OrganizationModel>,
    );
    const newOrgList = await Promise.all(
      rawOrganizations.map(async item => {
        const org = oldOrgMap[item.id];
        if (org) {
          await org.handleOrganizationUpdate(item);
          delete oldOrgMap[item.id];
          return org;
        }
        return new OrganizationModel(item);
      }),
    );
    this._organizations = newOrgList;
    logger.info(`New organization list:`, {
      data: this._organizations.map(org => org.name),
    });
    this._updateAreaOrganizationsMap();
    await Promise.all(Object.values(oldOrgMap).map(org => org.destroy()));
  }

  private async _handleOrganizationMessage(
    message: BroadcastOrganizationMessage,
  ) {
    const { type, data } = message;
    logger.info(`handle organization message: ${type}`, {
      data: beautifyJsonStringify(data),
    });
    switch (type) {
      case 'update':
        await this._updateOrganization(data);
        break;
      case 'create':
        this._createOrganization(data);
        break;
      case 'delete':
        await this._deleteOrganization(data);
        break;
      default:
        throw new Error(`unknown organization message type: ${type}`);
    }
  }

  private async _updateOrganization(
    data: BroadcastOrganizationUpdateMessage['data'],
  ) {
    const orgModel = this._organizations.find(org => org.id === data.id);
    if (orgModel) {
      const originalAreas = orgModel.areas;
      orgModel.handleOrganizationUpdate(data);
      if (!orgModel.isValid) {
        await this._deleteOrganization({ id: orgModel.id }, true);
        originalAreas.forEach(area => {
          this._areaOrganizationsMap[area] = this._areaOrganizationsMap[
            area
          ]!.filter(org => org.id !== orgModel.id);
        });
        return;
      }
      const newAreas = orgModel.areas;
      if (!isArrayEqual(originalAreas, newAreas)) {
        this._updateAreaOrganizationsMap();
      }
    } else {
      const org = await getAvailableOrganization(data.id);
      if (org.data) {
        this._createOrganization(org.data);
      }
    }
  }

  private _createOrganization(
    data: BroadcastOrganizationMessageData & {
      guild_users?: BroadcastGuildUserMessageData[];
    },
  ) {
    const orgModel = new OrganizationModel({
      ...data,
      guild_users: data.guild_users || [],
    });
    this._organizations.push(orgModel);
    const areas = data.areas;
    areas.forEach(area => {
      if (!this._areaOrganizationsMap[area]) {
        this._areaOrganizationsMap[area] = [];
      }
      this._areaOrganizationsMap[area].push(orgModel);
    });
  }

  private async _deleteOrganization(
    data: { id: string },
    ignoreArea?: boolean,
  ) {
    const orgModel = this._organizations.find(org => org.id === data.id);
    if (orgModel) {
      await orgModel.destroy();
      this._organizations = this._organizations.filter(
        org => org.id !== data.id,
      );
      if (!ignoreArea) {
        const areas = orgModel.areas;
        areas.forEach(area => {
          if (this._areaOrganizationsMap[area]) {
            this._areaOrganizationsMap[area] = this._areaOrganizationsMap[
              area
            ].filter(org => org.id !== data.id);
          }
        });
      }
    }
  }

  private async _handleGuildUserMessage(message: BroadcastGuildUserMessage) {
    const { data } = message;
    logger.info(`handle guild user message:`, {
      data: beautifyJsonStringify(data),
    });
    if (data) {
      const org = this._organizations.find(org => org.id === data.org_id);
      if (org) {
        await org.handleGuildUserMessage(message);
      }
    }
  }

  private async _handleAnchorMessage(message: BroadcastAnchorMessage) {
    const { data } = message;
    logger.trace(`handle anchor message:`, {
      data,
    });
    const { region } = data;
    const area = getAreaByRegion(region);
    logger.trace(`find organizations by region:`, {
      region,
      area,
      organizations: ((area && this._areaOrganizationsMap[area]) || []).map(
        org => org.name,
      ),
    });
    if (area && this._areaOrganizationsMap[area]?.length) {
      await Promise.all(
        this._areaOrganizationsMap[area].map(org =>
          org.handleAnchorMessage(message),
        ),
      );
    }
  }

  async destroy() {
    await this._unsubscribeMessageBus();
    await Promise.all(this._organizations.map(org => org.destroy()));
    this._organizations = [];
    this._areaOrganizationsMap = {};
  }
}
