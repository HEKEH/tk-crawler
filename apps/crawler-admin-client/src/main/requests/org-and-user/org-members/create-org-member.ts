import type {
  CreateOrgMemberRequest,
  CreateOrgMemberResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function createOrgMember(
  params: CreateOrgMemberRequest,
): Promise<CreateOrgMemberResponse> {
  return commonRequest<CreateOrgMemberResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/create-org-member',
    params,
  });
}
