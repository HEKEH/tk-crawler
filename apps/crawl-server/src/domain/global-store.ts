import { ServerBroadcastMessageChannel } from '@tk-crawler/biz-shared';
import { redisMessageBus } from '@tk-crawler/database';

export class GlobalStore {
  async init() {
    redisMessageBus.subscribe(
      ServerBroadcastMessageChannel.OrganizationMessage,
      message => {
        console.log(message);
      },
    );
    redisMessageBus.subscribe(
      ServerBroadcastMessageChannel.GuildUserMessage,
      message => {
        console.log(message);
      },
    );
    redisMessageBus.subscribe(
      ServerBroadcastMessageChannel.AnchorMessage,
      message => {
        console.log(message);
      },
    );
  }

  async destroy() {
    await redisMessageBus.quit();
  }
}
