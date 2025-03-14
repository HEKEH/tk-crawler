import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

import type {
  AnchorFollowGroup,
  AnchorFollowGroupWithAnchorIds,
} from '../../follow-help';

export interface CreateAnchorFollowGroupRequest {
  name: string;
  anchor_ids: string[];
}

export interface CreateAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface GetAnchorFollowGroupListRequest {
  page_num: number;
  page_size: number;
  filter?: Prisma.AnchorFollowGroupWhereInput;
  order_by?: Prisma.AnchorFollowGroupOrderByWithRelationInput;
}

export interface GetAnchorFollowGroupListResponseData {
  list: Omit<AnchorFollowGroup, 'anchors'>[];
  total: number;
}

export interface GetAnchorFollowGroupListResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: GetAnchorFollowGroupListResponseData;
}

export interface GetAnchorFollowGroupRequest {
  id: string;
}

export interface GetAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: AnchorFollowGroup;
}

export interface GetAnchorFollowGroupWithAnchorIdsRequest {
  id: string;
}

export interface GetAnchorFollowGroupWithAnchorIdsResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: AnchorFollowGroupWithAnchorIds;
}

export interface DeleteAnchorFollowGroupRequest {
  id: string[];
}

export interface DeleteAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface UpdateAnchorFollowGroupRequest {
  id: string;
  name: string;
  added_anchor_ids?: string[];
  removed_anchor_ids?: string[];
}

export interface UpdateAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface ClearAnchorFollowGroupRequest {
  filter?: Prisma.AnchorFollowGroupWhereInput;
}

export interface ClearAnchorFollowGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
