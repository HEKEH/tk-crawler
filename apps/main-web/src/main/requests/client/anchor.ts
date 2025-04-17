import type {
  ClearAnchorCheckRequest,
  ClearAnchorCheckResponse,
  GetAnchorListRequest,
  GetAnchorListResponse,
} from '@tk-crawler/biz-shared';

import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';
import { redirectToLogin } from '../../router';

export function getAnchorList(params: GetAnchorListRequest, token: string) {
  return commonRequest<GetAnchorListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/anchor/list',
    params,
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function clearAnchorCheck(
  token: string,
  params: ClearAnchorCheckRequest,
) {
  return commonRequest<ClearAnchorCheckResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/anchor/clear-check',
    params,
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
