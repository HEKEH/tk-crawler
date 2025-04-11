import type {
  DeleteAnchorCrawlRecordRequest,
  DeleteAnchorCrawlRecordResponse,
} from '@tk-crawler/biz-shared';
import { getConfig } from '../../config';
import { commonRequest } from '../utils/common-request';

export async function deleteAnchorCrawlRecord(
  data: DeleteAnchorCrawlRecordRequest,
): Promise<DeleteAnchorCrawlRecordResponse> {
  const response = await commonRequest<DeleteAnchorCrawlRecordResponse>({
    baseURL: getConfig().ownServerUrl,
    method: 'post',
    path: '/anchor-pool/delete-anchor-crawl-record',
    params: data,
  });
  return response;
}
