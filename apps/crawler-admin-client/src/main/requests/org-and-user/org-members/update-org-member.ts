import type {
  UpdateOrgMemberRequest,
  UpdateOrgMemberResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../../shared';
import config from '../../../config';

export function updateOrgMember(
  params: UpdateOrgMemberRequest,
): Promise<UpdateOrgMemberResponse> {
  return commonRequest<UpdateOrgMemberResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/update-org-member',
    params,
  });
}
