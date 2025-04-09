import type { BroadcastGuildUserMessageData } from '@tk-crawler/biz-shared';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { getAvailableOrganizationList } from '../../services';
import { GuildUserModel } from './guild-user-model';

export class GuildUserCollection {
  private _guildUsers: GuildUserModel[] = [];
  // private _messageBusUnsubscribes: (() => Promise<void>)[] = [];

  constructor(data: BroadcastGuildUserMessageData[]) {
    this._guildUsers = data.map(item => new GuildUserModel(item));
  }

  // private async _subscribeMessageBus(
  //   channel: ServerBroadcastMessageChannel,
  //   callback: RedisMessageBusCallback,
  // ) {
  //   const { unsubscribe } = await redisMessageBus.subscribe(channel, callback);
  //   this._messageBusUnsubscribes.push(unsubscribe);
  // }

  // private async _unsubscribeMessageBus() {
  //   await Promise.all(
  //     this._messageBusUnsubscribes.map(unsubscribe => unsubscribe()),
  //   );
  //   this._messageBusUnsubscribes = [];
  // }

  async update() {
    const { list: rawOrganizations } = await getAvailableOrganizationList();
    logger.info(`update organization list:`, {
      data: beautifyJsonStringify(rawOrganizations),
    });
    // TODO: 更新组织列表
  }

  async destroy() {
    this._guildUsers = [];
    // await this._unsubscribeMessageBus();
  }
}
