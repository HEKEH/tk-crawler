import type {
  CreateTKGuildUserRequest,
  CreateTKGuildUserResponse,
  DeleteTKGuildUserRequest,
  DeleteTKGuildUserResponse,
  GetTKGuildUserDetailRequest,
  GetTKGuildUserDetailResponse,
  GetTKGuildUserListRequest,
  GetTKGuildUserListResponse,
  IsAnyAccountErrorRequest,
  IsAnyAccountErrorResponse,
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
  StopTKLiveAdminAccountRequest,
  StopTKLiveAdminAccountResponse,
  UpdateTKGuildUserRequest,
  UpdateTKGuildUserResponse,
} from '@tk-crawler/biz-shared';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import {
  CreateTKGuildUser,
  DeleteTKGuildUser,
  GetTKGuildUserDetail,
  GetTKGuildUserList,
  IsAnyAccountError,
  OwnServerUrl,
  Post,
  StartTKGuildUserAccount,
  StopTKGuildUserAccount,
  UpdateTKGuildUser,
} from '@tk-crawler/secure';
import {
  RESPONSE_CODE,
  simpleDecrypt,
  simpleEncrypt,
} from '@tk-crawler/shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

// Get TK Guild User list
export async function getTKGuildUserList(
  params: GetTKGuildUserListRequest,
  token: string,
) {
  const response = await commonRequest<GetTKGuildUserListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetTKGuildUserList,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
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

// Get TK Guild User detail
export async function getTKGuildUserDetail(
  params: GetTKGuildUserDetailRequest,
  token: string,
) {
  const response = await commonRequest<GetTKGuildUserDetailResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetTKGuildUserDetail,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
  if (response.status_code === RESPONSE_CODE.SUCCESS && response.data) {
    response.data = {
      ...response.data,
      password: simpleDecrypt(response.data.password, config.simplePasswordKey),
    };
  }
  return response;
}

// Create TK Guild User
export function createTKGuildUser(
  _params: CreateTKGuildUserRequest,
  token: string,
) {
  let params = _params;
  if (params.password) {
    params = {
      ...params,
      password: simpleEncrypt(params.password, config.simplePasswordKey),
    };
  }
  return commonRequest<CreateTKGuildUserResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: CreateTKGuildUser,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Update TK Guild User
export function updateTKGuildUser(
  _params: UpdateTKGuildUserRequest,
  token: string,
) {
  let params = _params;
  if (params.data.password) {
    params = {
      ...params,
      data: {
        ...params.data,
        password: simpleEncrypt(params.data.password, config.simplePasswordKey),
      },
    };
  }
  return commonRequest<UpdateTKGuildUserResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: UpdateTKGuildUser,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Delete TK Guild User
export function deleteTKGuildUser(
  params: DeleteTKGuildUserRequest,
  token: string,
) {
  return commonRequest<DeleteTKGuildUserResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: DeleteTKGuildUser,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Update TK Guild User Cookie
// export function updateTKGuildUserCookie(
//   params: UpdateTKGuildUserCookieRequest,
//   token: string,
// ) {
//   return commonRequest<UpdateTKGuildUserCookieResponse>({
//     baseURL: config.ownServerUrl,
//     method: 'post',
//     path: '/client/tk-guild-user/update-user-cookie',
//     params,
//     onTokenInvalid: redirectToLogin,
//     headers: {
//       [CLIENT_TOKEN_HEADER_KEY]: token,
//     },
//   });
// }

// Start TK Guild User
export function startTKGuildUserAccount(
  params: StartTKLiveAdminAccountRequest,
  token: string,
) {
  return commonRequest<StartTKLiveAdminAccountResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: StartTKGuildUserAccount,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Stop TK Guild User
export function stopTKGuildUserAccount(
  params: StopTKLiveAdminAccountRequest,
  token: string,
) {
  return commonRequest<StopTKLiveAdminAccountResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: StopTKGuildUserAccount,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Is Any TK Guild User Account Error
export function isAnyGuildUserAccountError(
  params: IsAnyAccountErrorRequest,
  token: string,
) {
  return commonRequest<IsAnyAccountErrorResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: IsAnyAccountError,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
