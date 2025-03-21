import type {
  OrgMemberLoginRequest,
  OrgMemberLoginResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function login(params: OrgMemberLoginRequest) {
  return commonRequest<OrgMemberLoginResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/auth/org-member-login',
    params,
  });
}
