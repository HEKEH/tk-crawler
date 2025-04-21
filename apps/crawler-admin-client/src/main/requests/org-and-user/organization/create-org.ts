import {
  type CreateOrgRequest,
  type CreateOrgResponse,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function createOrg(
  params: CreateOrgRequest,
  token: string,
): Promise<CreateOrgResponse> {
  return commonRequest<CreateOrgResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/create-org',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
