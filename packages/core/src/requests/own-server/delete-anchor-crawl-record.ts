import type {
  DeleteAnchorCrawlRecordRequest,
  DeleteAnchorCrawlRecordResponse,
} from '@tk-crawler/biz-shared';
import { getUrl } from '@tk-crawler/shared';
import { getConfig } from '../../config';
import { commonPostRequest } from '../utils/common-request';

export async function deleteAnchorCrawlRecord(
  data: DeleteAnchorCrawlRecordRequest,
): Promise<DeleteAnchorCrawlRecordResponse> {
  const url = getUrl({
    baseUrl: getConfig().ownServerUrl,
    path: '/anchor-pool/delete-anchor-crawl-record',
  });
  const response = await commonPostRequest<DeleteAnchorCrawlRecordResponse>({
    url,
    body: data,
  });
  return response;
}
