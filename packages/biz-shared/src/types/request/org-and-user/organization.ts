import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { AnchorRankLeague } from '../../anchor';
import type { OrganizationItem, OrganizationStatus } from '../../org-and-user';

export type CreateOrgRequest = Omit<
  OrganizationItem,
  | 'id'
  | 'membership_start_at'
  | 'membership_expire_at'
  | 'if_membership_valid'
  | 'mobile_devices'
  | 'owner_id'
  | 'owner'
  | 'ignore_commerce_anchor'
  | 'rank_league_limit'
  | 'highest_diamonds_limit'
> & {
  membership_days?: number;
};

export interface CreateOrgResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type UpdateOrgRequest = Partial<
  Omit<CreateOrgRequest, 'membership_days' | 'mobile_device_limit'>
> &
  Partial<
    Pick<
      OrganizationItem,
      'ignore_commerce_anchor' | 'rank_league_limit' | 'highest_diamonds_limit'
    >
  > &
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

export interface GetOrgListFilter {
  owner_id?: string;
  status?: OrganizationStatus;
  if_membership_valid?: boolean;
}

export interface GetOrgListRequest {
  page_num: number;
  page_size: number;
  filter?: GetOrgListFilter;
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

export interface UpdateOrgAutoFollowDeviceLimitRequest {
  id: string;
  auto_follow_device_limit: number;
}

export interface UpdateOrgAutoFollowDeviceLimitResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface OrgAnchorSearchPolicies {
  ignore_commerce_anchor: boolean;
  highest_diamonds_limit: number | null;
  rank_league_limit: AnchorRankLeague | null;
}

export type UpdateOrgAnchorSearchPoliciesRequest = OrgAnchorSearchPolicies;

export interface UpdateOrgAnchorSearchPoliciesResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
