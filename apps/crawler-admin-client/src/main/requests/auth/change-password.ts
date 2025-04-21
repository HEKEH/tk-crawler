import type {
  SystemUserChangePasswordRequest,
  SystemUserChangePasswordResponse,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { simpleEncrypt } from '@tk-crawler/shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function changePassword(
  params: SystemUserChangePasswordRequest,
  token: string,
) {
  return commonRequest<SystemUserChangePasswordResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/system/change-password',
    params: {
      old_password: simpleEncrypt(
        params.old_password,
        config.simplePasswordKey,
      ),
      new_password: simpleEncrypt(
        params.new_password,
        config.simplePasswordKey,
      ),
    },
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
