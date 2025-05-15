import type {
  GetAllTKGuildUserListRequest,
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
  StopTKLiveAdminAccountRequest,
  SystemCrawlStatisticsResponse,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import {
  OwnServerUrl,
  Post,
  SystemGetAllTKGuildUserList,
  SystemStartTKGuildUserAccount,
  SystemStopTKGuildUserAccount,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getAllTKGuildUserList(
  params: GetAllTKGuildUserListRequest,
  token: string,
) {
  return commonRequest<SystemCrawlStatisticsResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemGetAllTKGuildUserList,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function startTKGuildUserAccount(
  params: StartTKLiveAdminAccountRequest,
  token: string,
) {
  return commonRequest<StartTKLiveAdminAccountResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemStartTKGuildUserAccount,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function stopTKGuildUserAccount(
  params: StopTKLiveAdminAccountRequest,
  token: string,
) {
  return commonRequest<StartTKLiveAdminAccountResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemStopTKGuildUserAccount,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
