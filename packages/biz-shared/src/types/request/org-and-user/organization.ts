import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { OrganizationItem } from '../../org-and-user';

export type CreateOrgRequest = Omit<
  OrganizationItem,
  | 'id'
  | 'membership_start_at'
  | 'membership_expire_at'
  | 'if_membership_valid'
  | 'mobile_devices'
  | 'owner_id'
  | 'owner'
>;

export interface CreateOrgResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type UpdateOrgRequest = Partial<CreateOrgRequest> &
  Pick<OrganizationItem, 'id'>;

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
  order_by?: Prisma.OrganizationOrderByWithRelationInput & {
    user_count?: Prisma.SortOrder;
  };
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

export interface UpdateOrgMembershipRequest {
  id: string;
  membership_days: number;
}

export interface UpdateOrgMembershipResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface OrgAnchorSearchPolicies {
  ignore_commerce_anchor: boolean;
}

export type UpdateOrgAnchorSearchPoliciesRequest = OrgAnchorSearchPolicies;

export interface UpdateOrgAnchorSearchPoliciesResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
