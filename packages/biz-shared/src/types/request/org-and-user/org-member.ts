import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';
import type { OrgMemberItem } from '../../org-and-user';

export type CreateOrgMemberRequest = Omit<OrgMemberItem, 'id'>;

export interface CreateOrgMemberResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface UpdateOrgMemberRequest {
  org_id: string;
  data: Partial<Omit<CreateOrgMemberRequest, 'org_id'>> &
    Pick<OrgMemberItem, 'id'>;
}

export interface UpdateOrgMemberResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface DeleteOrgMemberRequest {
  org_id: string;
  id: string;
}

export interface DeleteOrgMemberResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface GetOrgMemberListRequest {
  org_id: string;
  page_num: number;
  page_size: number;
  filter?: Prisma.OrgUserWhereInput;
  order_by?: Prisma.OrgUserOrderByWithRelationInput;
}

export interface GetOrgMemberListResponseData {
  list: Omit<OrgMemberItem, 'password'>[];
  total: number;
}

export interface GetOrgMemberListResponse {
  status_code: RESPONSE_CODE;
  data?: GetOrgMemberListResponseData;
  message?: string;
}
