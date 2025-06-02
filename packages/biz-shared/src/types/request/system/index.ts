import type {
  AdminFeature,
  AdminPrivilege,
  SystemAdminUserRole,
} from '@tk-crawler/biz-shared';
import type { Prisma } from '@tk-crawler/database';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

export interface SystemUserLoginRequest {
  username: string;
  password: string;
}

export enum SystemAdminUserStatus {
  /** 正常 */
  normal = 1,
  /** 禁用 */
  disabled = 0,
}

export interface SystemAdminUserInfo {
  id: string;
  username: string;
  password?: string;
  role_id: SystemAdminUserRole;
  status: SystemAdminUserStatus;
  privileges: AdminPrivilege[] | 'all';
  features: AdminFeature[];
  created_at: Date;
  updated_at: Date;
}

export interface SystemAdminUser {
  user_info: SystemAdminUserInfo;
}

export type SystemUserLoginSuccessData = SystemAdminUser;

export interface SystemUserLoginResponseData extends SystemAdminUser {
  token: string;
}

export interface SystemUserLoginResponse {
  status_code: RESPONSE_CODE;
  data?: SystemUserLoginResponseData;
  message?: string;
}

export type SystemUserLoginByTokenResponseData = SystemUserLoginSuccessData;

export interface SystemUserLoginByTokenResponse {
  status_code: RESPONSE_CODE;
  data?: SystemUserLoginByTokenResponseData;
  message?: string;
}

export interface SystemUserChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface SystemUserChangePasswordResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface SystemCrawlStatisticsRequest {
  force_refresh?: boolean;
}

export interface SystemCrawlStatisticsResponseData {
  statistics: {
    total_anchor_count: number;
    /** 24小时内新建的 */
    total_anchors_added_24h: number;
    /** 24小时内爬的主播，包括新建和更新 */
    total_anchors_crawled_24h: number;
    /** 1小时内新建的 */
    total_anchors_added_1h: number;
    /** 1小时内爬的主播，包括新建和更新 */
    total_anchors_crawled_1h: number;
  };
  query_at: Date;
}

export interface SystemCrawlStatisticsResponse {
  status_code: RESPONSE_CODE;
  data?: SystemCrawlStatisticsResponseData;
  message?: string;
}

export type CreateSystemAdminUserRequest = Omit<
  SystemAdminUserInfo,
  'id' | 'privileges'
>;

export interface CreateSystemAdminUserResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface UpdateSystemAdminUserRequest {
  data: Partial<Omit<CreateSystemAdminUserRequest, 'org_id'>> &
    Pick<SystemAdminUserInfo, 'id'>;
}

export interface UpdateSystemAdminUserResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface DeleteSystemAdminUserRequest {
  id: string;
}

export interface DeleteSystemAdminUserResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface GetSystemAdminUserListFilter {
  username?: string;
  role_id?: SystemAdminUserRole;
  status?: SystemAdminUserStatus;
}

export type SystemAdminUserWhereInput = Prisma.SystemAdminUserWhereInput;

export interface GetSystemAdminUserListRequest {
  page_num: number;
  page_size: number;
  filter?: GetSystemAdminUserListFilter;
  order_by?: Prisma.SystemAdminUserOrderByWithRelationInput;
}

export interface GetSystemAdminUserListResponseData {
  list: Omit<SystemAdminUserInfo, 'password' | 'privileges' | 'features'>[];
  total: number;
}

export interface GetSystemAdminUserListResponse {
  status_code: RESPONSE_CODE;
  data?: GetSystemAdminUserListResponseData;
  message?: string;
}
