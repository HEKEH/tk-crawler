import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { CollectedAnchorInfo } from './anchor';
import type { OrganizationItem } from './org-and-user';

export interface ShouldUpdateAnchorRequest {
  anchor_ids: string[];
}

export enum ShouldUpdateAnchorResult {
  NEED_UPDATE = 1,
  NO_NEED_UPDATE = 0,
}

export type ShouldUpdateAnchorResponseData = Record<
  string,
  ShouldUpdateAnchorResult
>;

export interface ShouldUpdateAnchorResponse {
  status_code: RESPONSE_CODE;
  data?: ShouldUpdateAnchorResponseData;
  message?: string;
}

export interface RecordAnchorCrawlRequest {
  anchor_id: string;
}

export interface RecordAnchorCrawlResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface DeleteAnchorCrawlRecordRequest {
  anchor_id: string;
}

export interface DeleteAnchorCrawlRecordResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type UpdateAnchorRequest = CollectedAnchorInfo;

export interface UpdateAnchorResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type CreateOrgRequest = Omit<
  OrganizationItem,
  'id' | 'membership_start_at' | 'membership_expire_at'
>;

export interface CreateOrgResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type UpdateOrgRequest = Omit<
  OrganizationItem,
  'membership_start_at' | 'membership_expire_at'
>;

export interface UpdateOrgResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface DeleteOrgRequest {
  id: string;
}

export interface DeleteOrgResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface GetOrgListRequest {
  page_num: number;
  page_size: number;
  filter?: Prisma.OrganizationWhereInput;
  order_by?: Prisma.OrganizationOrderByWithRelationInput;
}

export interface GetOrgListResponse {
  status_code: RESPONSE_CODE;
  data?: OrganizationItem[];
  total_count: number;
  message?: string;
}
