import type {
  OrgMemberChangePasswordRequest,
  OrgMemberChangePasswordResponse,
} from '@tk-crawler/biz-shared';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function changePassword(
  params: OrgMemberChangePasswordRequest,
  token: string,
) {
  return commonRequest<OrgMemberChangePasswordResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/auth/change-password',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
