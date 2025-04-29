import type {
  ClearAnchorCheckRequest,
  ClearAnchorCheckResponse,
  GetAnchorListForDownloadRequest,
  GetAnchorListForDownloadResponse,
  GetAnchorListRequest,
  GetAnchorListResponse,
} from '@tk-crawler/biz-shared';

import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getAnchorList(params: GetAnchorListRequest, token: string) {
  return commonRequest<GetAnchorListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/anchor/list',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function getAnchorListForDownload(
  params: GetAnchorListForDownloadRequest,
  token: string,
) {
  return commonRequest<GetAnchorListForDownloadResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/anchor/list-for-download',
    params,
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
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
