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

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';
import { redirectToLogin } from '../../router';

// Get TK Guild User list
export function getTKGuildUserList(
  params: GetTKGuildUserListRequest,
  token: string,
) {
  return commonRequest<GetTKGuildUserListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/get-user-list',
    params,
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Get TK Guild User detail
export function getTKGuildUserDetail(
  params: GetTKGuildUserDetailRequest,
  token: string,
) {
  return commonRequest<GetTKGuildUserDetailResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/tk-guild-user/get-user-detail',
    params,
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// Create TK Guild User
export function createTKGuildUser(
  params: CreateTKGuildUserRequest,
  token: string,
) {
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
  params: UpdateTKGuildUserRequest,
  token: string,
) {
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
