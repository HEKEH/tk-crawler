import {
  type CreateOrgMemberRequest,
  type CreateOrgMemberResponse,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function createOrgMember(
  params: CreateOrgMemberRequest,
  token: string,
): Promise<CreateOrgMemberResponse> {
  return commonRequest<CreateOrgMemberResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/create-org-member',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
