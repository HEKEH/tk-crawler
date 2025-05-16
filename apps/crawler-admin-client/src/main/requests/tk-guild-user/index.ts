import type {
  GetAllTKGuildUserListRequest,
  GetAllTKGuildUserListResponse,
  IsAnyGuildAccountErrorRequest,
  IsAnyGuildAccountErrorResponse,
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
  StopTKLiveAdminAccountRequest,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import {
  OwnServerUrl,
  Post,
  SystemGetAllTKGuildUserList,
  SystemIsAnyGuildAccountError,
  SystemStartTKGuildUserAccount,
  SystemStopTKGuildUserAccount,
} from '@tk-crawler/secure';
import { RESPONSE_CODE, simpleDecrypt } from '@tk-crawler/shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export async function getAllTKGuildUserList(
  params: GetAllTKGuildUserListRequest,
  token: string,
) {
  const response = await commonRequest<GetAllTKGuildUserListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemGetAllTKGuildUserList,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
  if (response.status_code === RESPONSE_CODE.SUCCESS && response.data) {
    response.data = {
      ...response.data,
      list: response.data?.list.map(item => ({
        ...item,
        password: simpleDecrypt(item.password, config.simplePasswordKey),
      })),
    };
  }
  return response;
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

export function isAnyGuildAccountError(
  params: IsAnyGuildAccountErrorRequest,
  token: string,
) {
  return commonRequest<IsAnyGuildAccountErrorResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemIsAnyGuildAccountError,
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
