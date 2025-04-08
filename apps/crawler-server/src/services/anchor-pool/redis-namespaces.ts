import { redisClient, RedisNamespace } from '@tk-crawler/database';

export const anchorCrawlRecordRedisNamespace = new RedisNamespace(
  redisClient,
  'a-c-r',
);
