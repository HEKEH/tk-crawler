import type { RESPONSE_CODE } from '@tk-crawler/shared';

export interface SystemUserLoginRequest {
  username: string;
  password: string;
}

export interface SystemAdminUserInfo {
  id: string;
  username: string;
  password?: string;
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
