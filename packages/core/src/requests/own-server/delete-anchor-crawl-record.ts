import type {
  DeleteAnchorCrawlRecordRequest,
  DeleteAnchorCrawlRecordResponse,
} from '@tk-crawler/shared';
import { getConfig } from '../../config';
import { commonPostRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';

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
