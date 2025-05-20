import type { Prisma } from '@tk-crawler/database/mysql';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { MobileDeviceItem } from '../mobile';

export interface AssignTaskRequest {
  anchor_check_ids: string[];
  org_member_id: string | null;
}

export interface AssignTaskResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface ClaimTaskRequest {
  anchor_check_ids: string[];
}

export interface ClaimTaskResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface CancelClaimTaskRequest {
  anchor_check_ids: string[];
}

export interface CancelClaimTaskResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface AnchorContactedRequest {
  ids: string[];
}

export interface AnchorContactedResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface GetMobileDeviceListRequest {
  page_num: number;
  page_size: number;
  filter?: Prisma.MobileDeviceWhereInput;
  order_by?: Prisma.MobileDeviceOrderByWithRelationInput;
}

export interface GetMobileDeviceListResponseData {
  list: MobileDeviceItem[];
  total: number;
}

export interface GetMobileDeviceListResponse {
  status_code: RESPONSE_CODE;
  data?: GetMobileDeviceListResponseData;
  message?: string;
}

export interface DeleteMobileDeviceRequest {
  id: string;
  org_id: string;
}

export interface DeleteMobileDeviceResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
