import {
  type DeleteOrgRequest,
  type DeleteOrgResponse,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function deleteOrg(
  params: DeleteOrgRequest,
  token: string,
): Promise<DeleteOrgResponse> {
  return commonRequest<DeleteOrgResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/delete-org',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
