import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { AutoFollowMobileDeviceItem } from '../../mobile';
import type {
  GetAnchorListFilter,
  GetAnchorListRequest,
  GetAnchorListResponse,
} from '../anchor';
import type { OrgMemberLoginRequest, OrgMemberLoginResponse } from '../auth';
import type { AnchorContactedRequest, AnchorContactedResponse } from '../task';

export interface MobileOrgMemberLoginRequest extends OrgMemberLoginRequest {
  device_id: string;
  device_name: string;
}

export type MobileOrgMemberLoginResponse = OrgMemberLoginResponse;

export interface LoginByTokenRequest {
  device_id: string;
}

export type LoginByTokenResponse = OrgMemberLoginResponse;

export type MobileGetAssignedAnchorListRequest = Omit<
  GetAnchorListRequest,
  'filter' | 'order_by' | 'include_task_assign' | 'include_anchor_contact'
> & {
  device_id: string;
  filter?: Omit<GetAnchorListFilter, 'assign_to' | 'contacted_by'>;
};

export type MobileGetAssignedAnchorListResponse = GetAnchorListResponse;

export type MobileAnchorContactedRequest = AnchorContactedRequest & {
  device_id: string;
};

export type MobileAnchorContactedResponse = AnchorContactedResponse;

export interface GetAutoFollowMobileDeviceListResponseData {
  list: AutoFollowMobileDeviceItem[];
  total: number;
}

export interface GetAutoFollowMobileDeviceListResponse {
  status_code: RESPONSE_CODE;
  data?: GetAutoFollowMobileDeviceListResponseData;
  message?: string;
}

export interface DeleteAutoFollowMobileDeviceRequest {
  id: string;
  org_id: string;
}

export interface DeleteAutoFollowMobileDeviceResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
