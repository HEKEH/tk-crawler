import type {
  SystemUserLoginRequest,
  SystemUserLoginResponse,
} from '@tk-crawler/biz-shared';

import { simpleEncrypt } from '@tk-crawler/shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function login(params: SystemUserLoginRequest) {
  return commonRequest<SystemUserLoginResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    secure: true,
    path: '/system/login',
    params: {
      ...params,
      password: simpleEncrypt(params.password, config.simplePasswordKey),
    },
  });
}
