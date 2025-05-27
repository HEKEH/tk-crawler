import {
  SYSTEM_TOKEN_HEADER_KEY,
  type UpdateOrgMemberRequest,
  type UpdateOrgMemberResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function updateOrgMember(
  params: UpdateOrgMemberRequest,
  token: string,
): Promise<UpdateOrgMemberResponse> {
  return commonRequest<UpdateOrgMemberResponse>({
    baseURL: config.ownServerUrl,
    secure: true,
    method: 'post',
    path: '/admin/org-and-user/update-org-member',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
