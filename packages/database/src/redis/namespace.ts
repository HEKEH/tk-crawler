import type { IRedisClient } from './client';

export class RedisNamespace {
  private _prefix: string;

  private _redisClient: IRedisClient;

  constructor(redisClient: IRedisClient, namespace: string) {
    this._prefix = namespace;
    this._redisClient = redisClient;
  }

  private getKey(key: string): string {
    return `${this._prefix}:${key}`;
  }

  async get(key: string): Promise<string | null> {
    return await this._redisClient.get(this.getKey(key));
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this._redisClient.mget(keys.map(key => this.getKey(key)));
  }

  /** ttl以秒为单位 */
  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    await this._redisClient.set(this.getKey(key), value, ttl);
  }

  /** ttl以秒为单位 */
  async mset(
    keyValuePairs: [string, string | number][],
    ttl?: number,
  ): Promise<void> {
    await this._redisClient.mset(
      keyValuePairs.map(([key, value]) => [this.getKey(key), value]),
      ttl,
    );
  }

  async del(key: string): Promise<void> {
    await this._redisClient.del(this.getKey(key));
  }

  /** 获取该命名空间下的所有键 */
  async keys(): Promise<string[]> {
    const keys = await this._redisClient.keys(`${this._prefix}:*`);
    // 移除前缀返回纯键名
    return keys.map(key => key.replace(`${this._prefix}:`, ''));
  }

  /** 删除该命名空间下的所有键 */
  async clear(): Promise<void> {
    const keys = await this._redisClient.keys(`${this._prefix}:*`);
    if (keys.length > 0) {
      await this._redisClient.del(...keys);
    }
  }
}
