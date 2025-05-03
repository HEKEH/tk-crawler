import {
  SYSTEM_TOKEN_HEADER_KEY,
  type UpdateOrgRequest,
  type UpdateOrgResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function updateOrg(
  params: UpdateOrgRequest,
  token: string,
): Promise<UpdateOrgResponse> {
  return commonRequest<UpdateOrgResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    secure: true,
    path: '/admin/org-and-user/update-org',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
