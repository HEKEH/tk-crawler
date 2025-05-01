import {
  SYSTEM_TOKEN_HEADER_KEY,
  type SystemUserLoginByTokenResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import { ElNotification } from 'element-plus';
import config from '../../config';

export function loginByToken(
  token: string,
): Promise<SystemUserLoginByTokenResponse> {
  try {
    return commonRequest<SystemUserLoginByTokenResponse>({
      baseURL: config.ownServerUrl,
      method: 'post',
      path: '/system/login-by-token',
      headers: {
        [SYSTEM_TOKEN_HEADER_KEY]: token,
      },
    });
  } catch (error) {
    ElNotification.error({
      message: (error as Error)?.message,
    });
    throw error;
  }
}
