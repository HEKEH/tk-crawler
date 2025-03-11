import type {
  DeleteOrgMemberRequest,
  DeleteOrgMemberResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function deleteOrgMember(
  params: DeleteOrgMemberRequest,
): Promise<DeleteOrgMemberResponse> {
  return commonRequest<DeleteOrgMemberResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/delete-org-member',
    params,
  });
}
