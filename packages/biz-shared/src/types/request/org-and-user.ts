import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { OrganizationItem } from '../org-and-user';

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

export interface GetOrgListResponseData {
  list: OrganizationItem[];
  total: number;
}

export interface GetOrgListResponse {
  status_code: RESPONSE_CODE;
  data?: GetOrgListResponseData;
  message?: string;
}
