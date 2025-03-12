import type {
  OrgMemberLoginByTokenRequest,
  OrgMemberLoginByTokenResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';
import { redirectToLogin } from '../../router';

export function loginByToken(
  params: OrgMemberLoginByTokenRequest,
): Promise<OrgMemberLoginByTokenResponse> {
  return commonRequest<OrgMemberLoginByTokenResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/auth/org-member-login-by-token',
    params,
    onTokenInvalid: redirectToLogin,
  });
}
