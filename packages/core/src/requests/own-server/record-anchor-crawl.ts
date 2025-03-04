import type {
  RecordAnchorCrawlRequest,
  RecordAnchorCrawlResponse,
} from '@tk-crawler/biz-shared';
import { getConfig } from '../../config';
import { commonPostRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';

export async function recordAnchorCrawl(
  data: RecordAnchorCrawlRequest,
): Promise<RecordAnchorCrawlResponse> {
  const url = getUrl({
    baseUrl: getConfig().ownServerUrl,
    path: '/anchor-pool/record-anchor-crawl',
  });
  const response = await commonPostRequest<RecordAnchorCrawlResponse>({
    url,
    body: data,
  });
  return response;
}
