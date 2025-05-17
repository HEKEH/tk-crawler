import type { AdminPrivilege, AdminUserRole } from '@tk-crawler/biz-shared';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

export interface SystemUserLoginRequest {
  username: string;
  password: string;
}

export interface SystemAdminUserInfo {
  id: string;
  username: string;
  password?: string;
  role_id: AdminUserRole;
  privileges: AdminPrivilege[] | 'all';
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
