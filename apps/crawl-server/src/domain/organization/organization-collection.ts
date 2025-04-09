import type {
  BroadcastAnchorMessage,
  BroadcastGuildUserMessage,
  BroadcastOrganizationMessage,
} from '@tk-crawler/biz-shared';
import type { RedisMessageBusCallback } from '@tk-crawler/database';
import { ServerBroadcastMessageChannel } from '@tk-crawler/biz-shared';
import { redisMessageBus } from '@tk-crawler/database';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { getAvailableOrganizationList } from '../../services';
import { OrganizationModel } from './organization-model';

export class OrganizationCollection {
  private _organizations: OrganizationModel[] = [];
  private _messageBusUnsubscribes: (() => Promise<void>)[] = [];
  constructor() {}

  async init() {
    const { list: rawOrganizations } = await getAvailableOrganizationList();
    logger.info(`init organization list:`, {
      data: beautifyJsonStringify(rawOrganizations),
    });
    this._organizations = rawOrganizations.map(
      item => new OrganizationModel(item),
    );
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
    // TODO: 更新组织列表
  }

  private async _handleOrganizationMessage(
    message: BroadcastOrganizationMessage,
  ) {
    const { type, data } = message;
    logger.info(`handle organization message: ${type}`, {
      data: beautifyJsonStringify(data),
    });
    // TODO
    switch (type) {
      case 'update':
        break;
      case 'create':
        break;
      case 'delete':
        break;
    }
  }

  private async _handleGuildUserMessage(message: BroadcastGuildUserMessage) {
    const { data } = message;
    logger.info(`handle guild user message:`, {
      data: beautifyJsonStringify(data),
    });
    // TODO
  }

  private async _handleAnchorMessage(message: BroadcastAnchorMessage) {
    const { data } = message;
    logger.info(`handle anchor message:`, {
      data: beautifyJsonStringify(data),
    });
    // TODO
  }

  async destroy() {
    this._organizations = [];
    await this._unsubscribeMessageBus();
  }
}
