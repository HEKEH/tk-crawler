import type {
  OrgMemberLoginByTokenRequest,
  OrgMemberLoginByTokenResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function loginByToken(
  params: OrgMemberLoginByTokenRequest,
): Promise<OrgMemberLoginByTokenResponse> {
  return commonRequest<OrgMemberLoginByTokenResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/auth/org-member-login-by-token',
    params,
  });
}
