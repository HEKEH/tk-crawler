import type {
  UpdateOrgMembershipRequest,
  UpdateOrgMembershipResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../shared';
import config from '../../config';

export function updateOrgMembership(
  params: UpdateOrgMembershipRequest,
): Promise<UpdateOrgMembershipResponse> {
  return commonRequest<UpdateOrgMembershipResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/org-and-user/update-org-membership',
    params,
  });
}
