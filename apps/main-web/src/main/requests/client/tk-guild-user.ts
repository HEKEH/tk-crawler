import type {
  CreateTKGuildUserRequest,
  CreateTKGuildUserResponse,
  DeleteTKGuildUserRequest,
  DeleteTKGuildUserResponse,
  GetTKGuildUserDetailRequest,
  GetTKGuildUserDetailResponse,
  GetTKGuildUserListRequest,
  GetTKGuildUserListResponse,
  UpdateTKGuildUserCookieRequest,
  UpdateTKGuildUserCookieResponse,
  UpdateTKGuildUserRequest,
  UpdateTKGuildUserResponse,
} from '@tk-crawler/biz-shared';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import {
  RESPONSE_CODE,
  simpleDecrypt,
  simpleEncrypt,
} from '@tk-crawler/shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';
import { redirectToLogin } from '../../router';

// Get TK Guild User list
export async function getTKGuildUserList(
  params: GetTKGuildUserListRequest,
  token: string,
) {
  const response = await commonRequest<GetTKGuildUserListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/get-user-list',
    params,
    onTokenInvalid: redirectToLogin,
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/get-user-detail',
    params,
    onTokenInvalid: redirectToLogin,
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/create-user',
    params,
    onTokenInvalid: redirectToLogin,
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/update-user',
    params,
    onTokenInvalid: redirectToLogin,
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/delete-user',
    params,
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Update TK Guild User Cookie
export function updateTKGuildUserCookie(
  params: UpdateTKGuildUserCookieRequest,
  token: string,
) {
  return commonRequest<UpdateTKGuildUserCookieResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/update-user-cookie',
    params,
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
