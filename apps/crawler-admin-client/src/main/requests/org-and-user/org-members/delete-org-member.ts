import {
  type DeleteOrgMemberRequest,
  type DeleteOrgMemberResponse,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function deleteOrgMember(
  params: DeleteOrgMemberRequest,
  token: string,
): Promise<DeleteOrgMemberResponse> {
  return commonRequest<DeleteOrgMemberResponse>({
    baseURL: config.ownServerUrl,
    secure: true,
    method: 'post',
    path: '/admin/org-and-user/delete-org-member',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
