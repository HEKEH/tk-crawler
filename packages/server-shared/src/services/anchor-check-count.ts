import type { Logger } from '@tk-crawler/shared';
import { redisClient, RedisNamespace } from '@tk-crawler/database';
import dayjs from 'dayjs';

export interface RecordAnchorCheckRedisParams {
  org_id: string;
  guild_user_id: string;
}

export const checkAnchorRecordRedisNamespace = new RedisNamespace(
  redisClient,
  'c-a-r-d-h', // check anchor record of day and hour
);

function getQueryKeys({
  org_id,
  guild_user_id,
}: RecordAnchorCheckRedisParams): {
  day_key: string;
  hour_key: string;
} {
  const now = dayjs();

  // 生成 key
  const hourKey = `${org_id}:${guild_user_id}:hour:${now.format('YYYYMMDDHH')}`;
  const dayKey = `${org_id}:${guild_user_id}:day:${now.format('YYYYMMDD')}`;

  return {
    hour_key: checkAnchorRecordRedisNamespace.getKey(hourKey),
    day_key: checkAnchorRecordRedisNamespace.getKey(dayKey),
  };
}

export async function recordAnchorCheckCount(
  { org_id, guild_user_id }: RecordAnchorCheckRedisParams,
  logger: Logger,
): Promise<void> {
  logger.info('[recordAnchorCheckCount params]', {
    org_id,
    guild_user_id,
  });
  const { hour_key, day_key } = getQueryKeys({ org_id, guild_user_id });

  const pipeline = checkAnchorRecordRedisNamespace.pipeline();
  pipeline.incr(hour_key);
  pipeline.incr(day_key);
  pipeline.expire(hour_key, 2 * 60 * 60);
  pipeline.expire(day_key, 48 * 60 * 60);
  await pipeline.exec();
}

export interface RecordAnchorCheckRedisResponseData {
  query_per_hour: number;
  query_per_day: number;
}

export async function getAnchorCheckCount(
  params: RecordAnchorCheckRedisParams[],
  logger: Logger,
): Promise<RecordAnchorCheckRedisResponseData[]> {
  // 获取所有参数的keys
  const keys = params.map(param => getQueryKeys(param));
  logger.info('[getAnchorCheckRedisRecord params]', {
    params,
  });

  // 创建pipeline
  const pipeline = checkAnchorRecordRedisNamespace.pipeline();

  // 添加所有查询命令
  keys.forEach(({ hour_key, day_key }) => {
    pipeline.get(hour_key);
    pipeline.get(day_key);
  });

  // 执行pipeline
  const results = await pipeline.exec();

  // 处理结果
  const response: RecordAnchorCheckRedisResponseData[] = [];
  for (let i = 0; i < params.length; i++) {
    const hourResult = results?.[i * 2]?.[1] as string | null;
    const dayResult = results?.[i * 2 + 1]?.[1] as string | null;

    response.push({
      query_per_hour: Number.parseInt(hourResult || '0', 10),
      query_per_day: Number.parseInt(dayResult || '0', 10),
    });
  }
  logger.info('[getAnchorCheckRedisRecord response]', {
    response,
  });

  return response;
}
