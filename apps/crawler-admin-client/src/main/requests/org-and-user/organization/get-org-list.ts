import {
  type GetOrgListRequest,
  type GetOrgListResponse,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function getOrgList(
  params: GetOrgListRequest,
  token: string,
): Promise<GetOrgListResponse> {
  return commonRequest<GetOrgListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/get-org-list',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
