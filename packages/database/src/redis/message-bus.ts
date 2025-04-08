import { getLogger } from '../infra';
import { type IRedisClient, redisClient } from './client';

class RedisMessageBus {
  private _client: IRedisClient;
  private _subscriptions: Map<string, Set<(message: string) => void>> =
    new Map();

  private _subscriptionInitialized = false;

  constructor(client: IRedisClient) {
    this._client = client;
  }

  private get redis() {
    return this._client.redis;
  }

  /**
   * 订阅 Redis 频道
   * @param channel 频道名称
   * @param callback 接收消息的回调函数
   * @returns 取消订阅的函数
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<() => Promise<void>> {
    // 初始化消息处理器（只需执行一次）
    if (!this._subscriptionInitialized) {
      this._initializeSubscriptionHandler();
    }

    // 检查是否是该频道的第一个订阅者
    const isFirstSubscriber =
      !this._subscriptions.has(channel) ||
      this._subscriptions.get(channel)!.size === 0;

    // 将回调添加到订阅映射中
    if (!this._subscriptions.has(channel)) {
      this._subscriptions.set(channel, new Set());
    }
    this._subscriptions.get(channel)!.add(callback);

    // 如果是第一个订阅者，向 Redis 发送订阅命令
    if (isFirstSubscriber) {
      await this.redis.subscribe(channel);
      getLogger().info(`Subscribed to channel: ${channel}`);
    }

    // 返回取消订阅的函数
    return async () => {
      await this._unsubscribe(channel, callback);
    };
  }

  /**
   * 初始化订阅消息处理器
   */
  private _initializeSubscriptionHandler(): void {
    try {
      this.redis.on('message', (channel: string, message: string) => {
        // 获取该频道的所有回调函数
        const callbacks = this._subscriptions.get(channel);
        if (callbacks && callbacks.size > 0) {
          // 调用所有注册的回调函数
          callbacks.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error(
                `Error in Redis subscription callback for channel ${channel}:`,
                error,
              );
            }
          });
        }
      });

      this._subscriptionInitialized = true;
    } catch (error) {
      getLogger().error(
        'Redis subscription handler initialization failed:',
        error,
      );
    }
  }

  /**
   * 取消订阅
   * @param channel 频道名称
   * @param callback 要移除的回调函数
   */
  private async _unsubscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    const callbacks = this._subscriptions.get(channel);
    if (!callbacks) {
      return;
    }

    // 移除特定的回调函数
    callbacks.delete(callback);

    // 如果是最后一个订阅者，从 Redis 取消订阅
    if (callbacks.size === 0) {
      await this.redis.unsubscribe(channel);
      this._subscriptions.delete(channel);
      getLogger().info(`Unsubscribed from channel: ${channel}`);
    }
  }

  /**
   * 发布消息到频道
   * @param channel 频道名称
   * @param message 消息内容
   * @returns 接收到消息的订阅者数量
   */
  async publish(channel: string, message: string): Promise<number> {
    try {
      const res = await this.redis.publish(channel, message);
      getLogger().info(`Published message to channel: ${channel}`);
      return res;
    } catch (error) {
      getLogger().error('Redis PUBLISH Error:', error);
      throw error;
    }
  }

  /**
   * 关闭连接前清理所有订阅
   */
  async quit(): Promise<void> {
    // 如果有活跃的订阅，取消所有订阅
    if (this._subscriptions.size > 0) {
      const channels = Array.from(this._subscriptions.keys());
      for (const channel of channels) {
        await this.redis.unsubscribe(channel);
      }
      this._subscriptions.clear();
      getLogger().info('All Redis subscriptions have been canceled');
    }

    // 关闭连接
    await this._client.quit();
  }
}

export type IRedisMessageBus = InstanceType<typeof RedisMessageBus>;

export const redisMessageBus = new RedisMessageBus(redisClient);
