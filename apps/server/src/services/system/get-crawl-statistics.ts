import type {
  SystemCrawlStatisticsRequest,
  SystemCrawlStatisticsResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';
import { BusinessError } from '../../utils';

const CACHE_KEY = 'system:crawl_statistics';
const CACHE_TTL = 5 * 60; // 5 minutes
// const RATE_LIMIT_KEY = 'system:crawl_statistics:rate_limit';
// const RATE_LIMIT_WINDOW = 60; // 1 minute
// const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

/** jwt token登录 */
export async function getCrawlStatistics(
  request: SystemCrawlStatisticsRequest,
): Promise<SystemCrawlStatisticsResponseData> {
  const startTime = Date.now();
  logger.info('[getCrawlStatistics] request', request);

  try {
    // // Check rate limit
    // const currentRequests = await redisClient.get(RATE_LIMIT_KEY);
    // if (
    //   currentRequests &&
    //   parseInt(currentRequests) >= MAX_REQUESTS_PER_WINDOW
    // ) {
    //   throw new BusinessError('请求过于频繁，请稍后再试');
    // }

    // // Increment rate limit counter
    // await redisClient.set(
    //   RATE_LIMIT_KEY,
    //   (parseInt(currentRequests || '0') + 1).toString(),
    //   RATE_LIMIT_WINDOW,
    // );
    if (!request.force_refresh) {
      // Try to get from cache first
      const cachedStats = await redisClient.get(CACHE_KEY);
      logger.info('[getCrawlStatistics] cachedStats');
      if (cachedStats) {
        logger.info('Cache hit for crawl statistics');
        logger.trace({ cachedStats });
        return JSON.parse(cachedStats);
      } else {
        logger.info('Cache miss for crawl statistics, querying database');
      }
    } else {
      await redisClient.del(CACHE_KEY);
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Use a single query with conditional counting
    const stats = await mysqlClient.prismaClient.$queryRaw<
      SystemCrawlStatisticsResponseData['statistics'][]
    >`
      SELECT
        COUNT(*) as total_anchor_count,
        SUM(CASE WHEN created_at >= ${twentyFourHoursAgo} THEN 1 ELSE 0 END) as total_anchors_added_24h,
        SUM(CASE WHEN updated_at >= ${twentyFourHoursAgo} THEN 1 ELSE 0 END) as total_anchors_crawled_24h,
        SUM(CASE WHEN created_at >= ${oneHourAgo} THEN 1 ELSE 0 END) as total_anchors_added_1h,
        SUM(CASE WHEN updated_at >= ${oneHourAgo} THEN 1 ELSE 0 END) as total_anchors_crawled_1h
      FROM Anchor
    `;

    const queryResult = stats[0];

    const queryEndTime = new Date();

    const duration = Date.now() - startTime;
    logger.info(`Crawl statistics query completed in ${duration}ms`);

    const result = {
      statistics: queryResult,
      query_at: queryEndTime,
    };

    // Cache the result
    await redisClient.set(CACHE_KEY, JSON.stringify(result), CACHE_TTL);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Error getting crawl statistics after ${duration}ms:`, error);

    if (error instanceof BusinessError) {
      throw error;
    }

    throw new BusinessError('获取爬虫统计数据失败');
  }
}
