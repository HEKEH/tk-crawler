import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { TKGuildUser } from '../../tk-guild-user';

// 创建用户请求和响应
export type CreateTKGuildUserRequest = Omit<
  TKGuildUser,
  'id' | 'created_at' | 'updated_at' | 'org_id' | 'cookie' | 'organization'
>;

export interface CreateTKGuildUserResponse {
  status_code: RESPONSE_CODE;
  data?: {
    id: string;
  };
  message?: string;
}

// 更新用户请求和响应
export interface UpdateTKGuildUserRequest {
  data: Partial<Omit<CreateTKGuildUserRequest, 'org_id'>> &
    Pick<TKGuildUser, 'id'>;
}

export interface UpdateTKGuildUserResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

// 删除用户请求和响应
export interface DeleteTKGuildUserRequest {
  ids: string[];
}

export interface DeleteTKGuildUserResponse {
  status_code: RESPONSE_CODE;
  data?: {
    deleted_count: number;
  };
  message?: string;
}

export type TKGuildUserWhereInput = Prisma.LiveAdminUserWhereInput;

export type TKGuildUserListFilter = TKGuildUserWhereInput & {
  search?: string;
};

// 获取用户列表请求和响应
export interface GetTKGuildUserListRequest {
  page_num: number;
  page_size: number;
  filter?: TKGuildUserListFilter;
  order_by?: Prisma.LiveAdminUserOrderByWithRelationInput;
}

export interface GetTKGuildUserListResponseData {
  list: Omit<TKGuildUser, 'cookie'>[];
  total: number;
}

export interface GetTKGuildUserListResponse {
  status_code: RESPONSE_CODE;
  data?: GetTKGuildUserListResponseData;
  message?: string;
}

// 获取单个用户详情请求和响应
export interface GetTKGuildUserDetailRequest {
  id: string;
}

export interface GetTKGuildUserDetailResponse {
  status_code: RESPONSE_CODE;
  data?: TKGuildUser;
  message?: string;
}

// 更新用户Cookie请求和响应
export interface UpdateTKGuildUserCookieRequest {
  id: string;
  cookie: string;
}

export interface UpdateTKGuildUserCookieResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface StartTKLiveAdminAccountRequest {
  user_id: string;
  cookie: string;
}

export interface StartTKLiveAdminAccountResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface StopTKLiveAdminAccountRequest {
  user_id: string;
}

export interface StopTKLiveAdminAccountResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
