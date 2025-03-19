import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

import type {
  AnchorFollowGroup,
  AnchorFollowGroupWithAnchorIds,
} from '../../follow-help';

export interface CreateAnchorFollowGroupRequest {
  org_id: string;
  name: string;
  anchor_table_ids: string[];
}

export interface CreateAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type AnchorFollowGroupWhereInput = Prisma.AnchorFollowGroupWhereInput;

export type AnchorFollowGroupListFilter = AnchorFollowGroupWhereInput & {
  search?: string;
};

export interface GetAnchorFollowGroupListRequest {
  org_id: string;
  page_num: number;
  page_size: number;
  filter?: AnchorFollowGroupListFilter;
  order_by?: Prisma.AnchorFollowGroupOrderByWithRelationInput & {
    anchors_count?: 'asc' | 'desc';
  };
}

export type AnchorFollowGroupItem = Omit<AnchorFollowGroup, 'anchors'> & {
  anchors_count: number;
};

export interface GetAnchorFollowGroupListResponseData {
  list: AnchorFollowGroupItem[];
  total: number;
}

export interface GetAnchorFollowGroupListResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: GetAnchorFollowGroupListResponseData;
}

export interface GetAnchorFollowGroupRequest {
  id: string;
  org_id: string;
}

export interface GetAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: AnchorFollowGroup;
}

export interface GetAnchorFollowGroupWithAnchorIdsRequest {
  id: string;
  org_id: string;
}

export interface GetAnchorFollowGroupWithAnchorIdsResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: AnchorFollowGroupWithAnchorIds;
}

export interface DeleteAnchorFollowGroupRequest {
  org_id: string;
  id: string[];
}

export interface DeleteAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  data?: {
    deleted_count: number;
  };
  message?: string;
}

export interface UpdateAnchorFollowGroupRequest {
  org_id: string;
  id: string;
  name?: string;
  added_anchor_table_ids?: string[];
  removed_anchor_table_ids?: string[];
}

export interface UpdateAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface ClearAnchorFollowGroupRequest {
  org_id: string;
  filter?: AnchorFollowGroupListFilter;
}

export interface ClearAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  data?: {
    deleted_count: number;
  };
  message?: string;
}
