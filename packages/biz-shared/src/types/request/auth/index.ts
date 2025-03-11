import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { OrganizationItem, OrgMemberItem } from '../../org-and-user';

export interface OrgMemberLoginRequest {
  username: string;
  password: string;
}

export interface OrgMemberLoginResponseData {
  user_info: Omit<OrgMemberItem, 'password'>;
  org_info: Omit<OrganizationItem, 'user_count'>;
  token: string;
}

export interface OrgMemberLoginResponse {
  status_code: RESPONSE_CODE;
  data?: OrgMemberLoginResponseData;
  message?: string;
}

export interface OrgMemberLoginByTokenRequest {
  token: string;
}

export type OrgMemberLoginByTokenResponseData = Omit<
  OrgMemberLoginResponseData,
  'token'
>;

export interface OrgMemberLoginByTokenResponse {
  status_code: RESPONSE_CODE;
  data?: OrgMemberLoginByTokenResponseData;
  message?: string;
}
