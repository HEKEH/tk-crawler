import {
  SYSTEM_TOKEN_HEADER_KEY,
  type SystemUserLoginByTokenResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function loginByToken(
  token: string,
  hideErrorNotify = true,
): Promise<SystemUserLoginByTokenResponse> {
  return commonRequest<SystemUserLoginByTokenResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/system/login-by-token',
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
    hideErrorNotify,
  });
}
