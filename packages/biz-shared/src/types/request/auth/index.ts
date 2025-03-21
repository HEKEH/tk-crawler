import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { OrganizationItem, OrgMemberItem } from '../../org-and-user';

export interface OrgMemberLoginRequest {
  username: string;
  password: string;
}

export interface OrgMemberUserInfoWithOrgInfo {
  user_info: Omit<OrgMemberItem, 'password'>;
  org_info: Omit<OrganizationItem, 'user_count'>;
}

export type OrgMemberLoginSuccessData = OrgMemberUserInfoWithOrgInfo;

export interface OrgMemberLoginResponseData
  extends OrgMemberUserInfoWithOrgInfo {
  token: string;
}

export interface OrgMemberLoginResponse {
  status_code: RESPONSE_CODE;
  data?: OrgMemberLoginResponseData;
  message?: string;
}

export type OrgMemberLoginByTokenResponseData = OrgMemberLoginSuccessData;

export interface OrgMemberLoginByTokenResponse {
  status_code: RESPONSE_CODE;
  data?: OrgMemberLoginByTokenResponseData;
  message?: string;
}
