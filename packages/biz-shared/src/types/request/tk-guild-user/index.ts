import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { Area } from '../../area';
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
  list: (Omit<
    TKGuildUser,
    'cookie' | 'current_query_per_hour' | 'current_query_per_day'
  > & {
    current_query_per_hour: number;
    current_query_per_day: number;
  })[];
  total: number;
}

export interface GetTKGuildUserListResponse {
  status_code: RESPONSE_CODE;
  data?: GetTKGuildUserListResponseData;
  message?: string;
}

export type GetAllTKGuildUserListRequest = GetTKGuildUserListRequest;

export interface GetAllTKGuildUserListResponseData {
  list: (Omit<
    TKGuildUser,
    'cookie' | 'current_query_per_hour' | 'current_query_per_day'
  > & {
    org_name: string;
  })[];
  total: number;
}

export interface GetAllTKGuildUserListResponse {
  status_code: RESPONSE_CODE;
  data?: GetAllTKGuildUserListResponseData;
  message?: string;
}

// 获取单个用户详情请求和响应
export interface GetTKGuildUserDetailRequest {
  id: string;
}

export interface GetTKGuildUserDetailResponse {
  status_code: RESPONSE_CODE;
  data?: Omit<TKGuildUser, 'cookie'>;
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
  faction_id: number;
  area: Area;
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

export interface IsAnyAccountErrorRequest {}

export interface IsAnyAccountErrorResponseData {
  has_error: boolean;
}

export interface IsAnyAccountErrorResponse {
  status_code: RESPONSE_CODE;
  data?: IsAnyAccountErrorResponseData;
  message?: string;
}
