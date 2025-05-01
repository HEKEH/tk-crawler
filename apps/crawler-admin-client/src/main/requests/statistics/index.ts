import type {
  SystemCrawlStatisticsRequest,
  SystemCrawlStatisticsResponse,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getCrawlStatistics(
  params: SystemCrawlStatisticsRequest,
  token: string,
) {
  return commonRequest<SystemCrawlStatisticsResponse>({
    baseURL: config.ownServerUrl,
    method: 'get',
    path: '/system/crawl-statistics',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
