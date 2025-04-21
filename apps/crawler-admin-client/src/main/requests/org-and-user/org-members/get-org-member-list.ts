import {
  type GetOrgMemberListRequest,
  type GetOrgMemberListResponse,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function getOrgMemberList(
  params: GetOrgMemberListRequest,
  token: string,
): Promise<GetOrgMemberListResponse> {
  return commonRequest<GetOrgMemberListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/get-org-member-list',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
