import type {
  GetOrgMemberListRequest,
  GetOrgMemberListResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../../shared';
import config from '../../../config';

export function getOrgMemberList(
  params: GetOrgMemberListRequest,
): Promise<GetOrgMemberListResponse> {
  return commonRequest<GetOrgMemberListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/get-org-member-list',
    params,
  });
}
