import type {
  AddSystemAdminUserBalanceRequest,
  AddSystemAdminUserBalanceResponse,
  CreateSystemAdminUserRequest,
  CreateSystemAdminUserResponse,
  DeleteSystemAdminUserRequest,
  DeleteSystemAdminUserResponse,
  GetAllTKGuildUserListRequest,
  GetAllTKGuildUserListResponse,
  GetSystemAdminUserListRequest,
  GetSystemAdminUserListResponse,
  IsAnyGuildAccountErrorRequest,
  IsAnyGuildAccountErrorResponse,
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
  StopTKLiveAdminAccountRequest,
  UpdateSystemAdminUserDiscountRequest,
  UpdateSystemAdminUserDiscountResponse,
  UpdateSystemAdminUserRequest,
  UpdateSystemAdminUserResponse,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import {
  OwnServerUrl,
  Post,
  SystemAddAdminUserBalance,
  SystemCreateAdminUser,
  SystemDeleteAdminUser,
  SystemGetAdminUserList,
  SystemGetAllTKGuildUserList,
  SystemIsAnyGuildAccountError,
  SystemStartTKGuildUserAccount,
  SystemStopTKGuildUserAccount,
  SystemUpdateAdminUser,
  SystemUpdateAdminUserDiscount,
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
  hideErrorNotify?: boolean,
) {
  return commonRequest<IsAnyGuildAccountErrorResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemIsAnyGuildAccountError,
    params,
    hideErrorNotify,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function getSystemAdminUserList(
  params: GetSystemAdminUserListRequest,
  token: string,
) {
  return commonRequest<GetSystemAdminUserListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemGetAdminUserList,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function createSystemAdminUser(
  params: CreateSystemAdminUserRequest,
  token: string,
) {
  return commonRequest<CreateSystemAdminUserResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemCreateAdminUser,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function updateSystemAdminUser(
  params: UpdateSystemAdminUserRequest,
  token: string,
) {
  return commonRequest<UpdateSystemAdminUserResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemUpdateAdminUser,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function updateSystemAdminUserDiscount(
  params: UpdateSystemAdminUserDiscountRequest,
  token: string,
) {
  return commonRequest<UpdateSystemAdminUserDiscountResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemUpdateAdminUserDiscount,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function addSystemAdminUserBalance(
  params: AddSystemAdminUserBalanceRequest,
  token: string,
) {
  return commonRequest<AddSystemAdminUserBalanceResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemAddAdminUserBalance,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function deleteSystemAdminUser(
  params: DeleteSystemAdminUserRequest,
  token: string,
) {
  return commonRequest<DeleteSystemAdminUserResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemDeleteAdminUser,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
