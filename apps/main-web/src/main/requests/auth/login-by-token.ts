import {
  CLIENT_TOKEN_HEADER_KEY,
  type OrgMemberLoginByTokenResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import { ElNotification } from 'element-plus';
import config from '../../config';

export function loginByToken(
  token: string,
  hideErrorNotify = true,
): Promise<OrgMemberLoginByTokenResponse> {
  try {
    return commonRequest<OrgMemberLoginByTokenResponse>({
      baseURL: config.ownServerUrl,
      method: 'post',
      path: '/auth/org-member-login-by-token',
      headers: {
        [CLIENT_TOKEN_HEADER_KEY]: token,
      },
      hideErrorNotify,
    });
  } catch (error) {
    ElNotification.error({
      message: (error as Error)?.message,
    });
    throw error;
  }
}
