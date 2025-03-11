import type {
  GetOrgListRequest,
  GetOrgListResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function getOrgList(
  params: GetOrgListRequest,
): Promise<GetOrgListResponse> {
  return commonRequest<GetOrgListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/get-org-list',
    params,
  });
}
