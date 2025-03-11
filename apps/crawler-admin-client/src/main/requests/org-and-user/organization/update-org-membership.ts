import type {
  UpdateOrgMembershipRequest,
  UpdateOrgMembershipResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function updateOrgMembership(
  params: UpdateOrgMembershipRequest,
): Promise<UpdateOrgMembershipResponse> {
  return commonRequest<UpdateOrgMembershipResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/update-org-membership',
    params,
  });
}
