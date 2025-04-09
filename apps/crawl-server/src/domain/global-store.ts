import { ServerBroadcastMessageChannel } from '@tk-crawler/biz-shared';
import { redisMessageBus } from '@tk-crawler/database';

export class GlobalStore {
  async init() {
    redisMessageBus.subscribe(
      ServerBroadcastMessageChannel.OrganizationMessage,
      (...args) => {
        console.log(...args);
      },
    );
    redisMessageBus.subscribe(
      ServerBroadcastMessageChannel.GuildUserMessage,
      (...args) => {
        console.log(...args);
      },
    );
    redisMessageBus.subscribe(
      ServerBroadcastMessageChannel.AnchorMessage,
      (...args) => {
        console.log(...args);
      },
    );
  }

  async destroy() {
    await redisMessageBus.quit();
  }
}
