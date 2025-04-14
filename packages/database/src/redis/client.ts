import Redis from 'ioredis';
import { getLogger } from '../infra';

class RedisClient {
  private _client: Redis | undefined;

  get redis() {
    if (!this._client) {
      throw new Error('Redis Client is not initialized');
    }
    return this._client;
  }

  constructor() {}

  async connect(
    config: {
      redisHost: string;
      redisPort: number;
      redisUsername?: string;
      redisPassword: string;
    },
    timeout: number = 5000,
  ): Promise<void> {
    if (!this._client) {
      this._client = new Redis({
        host: config.redisHost,
        port: config.redisPort,
        username: config.redisUsername,
        password: config.redisPassword,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      // 创建连接Promise
      const connectionPromise = new Promise<void>((resolve, reject) => {
        this._client!.once('ready', () => {
          getLogger().info('Redis Client Connected and Ready');
          resolve();
        });

        this._client!.once('error', err => {
          getLogger().error('Redis Client Error:', err);
          reject(err);
        });
      });

      // 创建超时Promise
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Redis connection timeout after ${timeout}ms`));
        }, timeout);
      });

      try {
        // 等待连接成功或超时
        await Promise.race([connectionPromise, timeoutPromise]);
        this._client.on('error', err => {
          getLogger().error('Redis Client Error:', err);
        });
      } catch (error) {
        // 清理连接
        if (this._client) {
          this._client.disconnect();
          this._client = undefined;
        }
        throw error;
      }
    }
  }

  /** 基础的 get 方法 */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      getLogger().error('Redis GET Error:', error);
      throw error;
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      if (keys.length === 0) {
        return [];
      }
      return await this.redis.mget(keys);
    } catch (error) {
      getLogger().error('Redis MGET Error:', error);
      throw error;
    }
  }

  private async _mset(
    keyValuePairs: [string, string | number][],
  ): Promise<void> {
    try {
      const data = Object.fromEntries(keyValuePairs);
      await this.redis.mset(data);
    } catch (error) {
      getLogger().error('Redis MSET Error:', error);
      throw error;
    }
  }

  private async _msetWithTTL(
    keyValuePairs: [string, string | number][],
    ttl: number,
  ): Promise<void> {
    try {
      if (keyValuePairs.length === 0) {
        return;
      }

      // 创建管道
      const pipeline = this.redis.pipeline();

      // 添加所有SET命令到管道
      for (const [key, value] of keyValuePairs) {
        pipeline.set(key, value, 'EX', ttl);
      }

      // 执行管道
      await pipeline.exec();
    } catch (error) {
      getLogger().error('Redis MSET with TTL Error:', error);
      throw error;
    }
  }

  /** ttl以秒为单位 */
  async mset(
    keyValuePairs: [string, string | number][],
    ttl?: number,
  ): Promise<void> {
    if (ttl) {
      await this._msetWithTTL(keyValuePairs, ttl);
    } else {
      await this._mset(keyValuePairs);
    }
  }

  /** ttl以秒为单位 */
  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.set(key, value, 'EX', ttl);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      getLogger().error('Redis SET Error:', error);
      throw error;
    }
  }

  /** 删除键 */
  async del(...keys: string[]): Promise<void> {
    try {
      await this.redis.del(...keys);
    } catch (error) {
      getLogger().error('Redis DEL Error:', error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      getLogger().error('Redis KEYS Error:', error);
      throw error;
    }
  }

  /** 关闭连接 */
  async quit(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      getLogger().info('Redis Client Closed');
    }
  }
}

export type IRedisClient = InstanceType<typeof RedisClient>;

/** 导出单例实例 */
export const redisClient = new RedisClient();

/** 导出订阅实例，必须要与常规的 redisClient 使用不同的实例，因为redis 的 subscribe 方法会阻塞 */
export const subscribeRedisClient = new RedisClient();
