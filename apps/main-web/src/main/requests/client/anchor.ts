import type {
  ClearAnchorCheckRequest,
  ClearAnchorCheckResponse,
  GetAnchorListForDownloadRequest,
  GetAnchorListForDownloadResponse,
  GetAnchorListRequest,
  GetAnchorListResponse,
} from '@tk-crawler/biz-shared';

import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import {
  ClearAnchorCheck,
  GetAnchorList,
  GetAnchorListForDownload,
  OwnServerUrl,
  Post,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getAnchorList(params: GetAnchorListRequest, token: string) {
  return commonRequest<GetAnchorListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetAnchorList,
    secure: true,
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
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetAnchorListForDownload,
    secure: true,
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
    baseURL: config[OwnServerUrl],
    method: Post,
    path: ClearAnchorCheck,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
