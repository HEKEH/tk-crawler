import type {
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
} from '@tk-crawler/biz-shared';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import config from '../config';
import { commonRequest } from './common-request';

// Start TK Guild User
export function startTKGuildUserAccount(
  params: StartTKLiveAdminAccountRequest,
  token: string,
) {
  return commonRequest<StartTKLiveAdminAccountResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/start-live-admin-account',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
