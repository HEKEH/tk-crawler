import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '../infra';
import { type IRedisClient, redisClient } from './client';

interface MessageEnvelope<T = any> {
  id: string; // 唯一ID
  timestamp: string; // ISO格式时间戳
  payload: T; // 原始消息内容
}

export type RedisMessageBusCallback<T = any> = (
  payLoad: T,
  meta: { id: string; timestamp: string },
) => void;

class RedisMessageBus {
  private _client: IRedisClient;
  private _subscriptions: Map<string, Set<RedisMessageBusCallback>> = new Map();

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
  async subscribe<T>(
    channel: string,
    callback: RedisMessageBusCallback<T>,
  ): Promise<{ unsubscribe: () => Promise<void> }> {
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
    return {
      unsubscribe: async () => {
        await this._unsubscribe(channel, callback);
      },
    };
  }

  /**
   * 初始化订阅消息处理器
   */
  private _initializeSubscriptionHandler(): void {
    try {
      this.redis.on('message', (channel: string, rawMessage: string) => {
        // 获取该频道的所有回调函数
        const callbacks = this._subscriptions.get(channel);
        if (callbacks && callbacks.size > 0) {
          try {
            // 解析消息信封
            const messageEnvelope = JSON.parse(rawMessage) as MessageEnvelope;
            const { id, payload, timestamp } = messageEnvelope;

            // 记录接收到的消息ID，便于追踪
            getLogger().debug(`Received message ${id} from channel ${channel}`);

            // 调用所有注册的回调函数，传递原始payload
            callbacks.forEach(callback => {
              try {
                callback(payload, { id, timestamp });
              } catch (error) {
                getLogger().error(
                  `Error in Redis subscription callback for channel ${channel}, message ${id}:`,
                  error,
                );
              }
            });
          } catch (error) {
            // 处理JSON解析错误或其他错误
            getLogger().error(
              `Error processing message from channel ${channel}: ${rawMessage}`,
              error,
            );
          }
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
  private async _unsubscribe<T>(
    channel: string,
    callback: RedisMessageBusCallback<T>,
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
   * @param payload 消息内容
   * @returns 接收到消息的订阅者数量
   */
  async publish<T>(channel: string, payload: T): Promise<number> {
    try {
      // 创建带有唯一ID的消息信封
      const messageEnvelope: MessageEnvelope<T> = {
        id: uuidv4(), // 生成唯一ID
        timestamp: new Date().toISOString(),
        payload, // 原始消息内容
      };

      // 序列化为JSON字符串
      const message = JSON.stringify(messageEnvelope);

      const res = await this.redis.publish(channel, message);
      getLogger().info(
        `Published message ${messageEnvelope.id} to channel: ${channel}`,
      );
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
  }
}

export type IRedisMessageBus = InstanceType<typeof RedisMessageBus>;

export const redisMessageBus = new RedisMessageBus(redisClient);
