import Redis from 'ioredis';
import config from '../../config';
import { logger } from '../../infra/logger';

export class RedisClient {
  private static instance: RedisClient;
  private _client: Redis | undefined;

  get client() {
    if (!this._client) {
      throw new Error('Redis Client is not initialized');
    }
    return this._client;
  }

  private constructor() {}

  async connect(timeout: number = 5000): Promise<void> {
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
          logger.info('Redis Client Connected and Ready');
          resolve();
        });

        this._client!.once('error', err => {
          logger.error('Redis Client Error:', err);
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
          logger.error('Redis Client Error:', err);
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

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /** 基础的 get 方法 */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET Error:', error);
      throw error;
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      if (keys.length === 0) {
        return [];
      }
      return await this.client.mget(keys);
    } catch (error) {
      logger.error('Redis MGET Error:', error);
      throw error;
    }
  }

  private async _mset(
    keyValuePairs: [string, string | number][],
  ): Promise<void> {
    try {
      const data = Object.fromEntries(keyValuePairs);
      await this.client.mset(data);
    } catch (error) {
      logger.error('Redis MSET Error:', error);
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
      const pipeline = this.client.pipeline();

      // 添加所有SET命令到管道
      for (const [key, value] of keyValuePairs) {
        pipeline.set(key, value, 'EX', ttl);
      }

      // 执行管道
      await pipeline.exec();
    } catch (error) {
      logger.error('Redis MSET with TTL Error:', error);
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
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET Error:', error);
      throw error;
    }
  }

  /** 删除键 */
  async del(...keys: string[]): Promise<void> {
    try {
      await this.client.del(...keys);
    } catch (error) {
      logger.error('Redis DEL Error:', error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS Error:', error);
      throw error;
    }
  }

  /** 关闭连接 */
  async quit(): Promise<void> {
    if (this._client) {
      await this._client.quit();
    }
  }
}

/** 导出单例实例 */
export const redisClient = RedisClient.getInstance();
