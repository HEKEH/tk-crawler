import { redisClient } from './client';

export class RedisNamespace {
  private _prefix: string;
  constructor(namespace: string) {
    this._prefix = namespace;
  }

  private getKey(key: string): string {
    return `${this._prefix}:${key}`;
  }

  async get(key: string): Promise<string | null> {
    return await redisClient.get(this.getKey(key));
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return await redisClient.mget(keys.map(key => this.getKey(key)));
  }

  /** ttl以秒为单位 */
  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    await redisClient.set(this.getKey(key), value, ttl);
  }

  /** ttl以秒为单位 */
  async mset(
    keyValuePairs: [string, string | number][],
    ttl?: number,
  ): Promise<void> {
    await redisClient.mset(
      keyValuePairs.map(([key, value]) => [this.getKey(key), value]),
      ttl,
    );
  }

  async del(key: string): Promise<void> {
    await redisClient.del(this.getKey(key));
  }

  /** 获取该命名空间下的所有键 */
  async keys(): Promise<string[]> {
    const keys = await redisClient.keys(`${this._prefix}:*`);
    // 移除前缀返回纯键名
    return keys.map(key => key.replace(`${this._prefix}:`, ''));
  }

  /** 删除该命名空间下的所有键 */
  async clear(): Promise<void> {
    const keys = await redisClient.keys(`${this._prefix}:*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
}
