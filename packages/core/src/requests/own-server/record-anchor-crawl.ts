import type {
  RecordAnchorCrawlRequest,
  RecordAnchorCrawlResponse,
} from '@tk-crawler/biz-shared';
import { getConfig } from '../../config';
import { commonRequest } from '../utils/common-request';

export async function recordAnchorCrawl(
  data: RecordAnchorCrawlRequest,
): Promise<RecordAnchorCrawlResponse> {
  const response = await commonRequest<RecordAnchorCrawlResponse>({
    baseURL: getConfig().ownServerUrl,
    method: 'post',
    path: '/anchor-pool/record-anchor-crawl',
    params: data,
  });
  return response;
}
