import {
  SYSTEM_TOKEN_HEADER_KEY,
  type UpdateOrgMembershipRequest,
  type UpdateOrgMembershipResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function updateOrgMembership(
  params: UpdateOrgMembershipRequest,
  token: string,
): Promise<UpdateOrgMembershipResponse> {
  return commonRequest<UpdateOrgMembershipResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    secure: true,
    path: '/admin/org-and-user/update-org-membership',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
