import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

import type {
  AnchorCommentTemplate,
  AnchorCommentTemplateGroup,
} from '../../follow-help';

export interface CreateAnchorCommentTemplateGroupRequest {
  org_id: string;
  name: string;
}

export interface CreateAnchorCommentTemplateGroupResponse {
  status_code: RESPONSE_CODE;
  data?: {
    id: string;
  };
  message?: string;
}

export interface UpdateAnchorCommentTemplateGroupRequest {
  org_id: string;
  id: string;
  name: string;
}

export interface UpdateAnchorCommentTemplateGroupResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type AnchorCommentTemplateGroupWhereInput =
  Prisma.AnchorCommentTemplateGroupWhereInput;

export type AnchorCommentTemplateGroupListFilter =
  AnchorCommentTemplateGroupWhereInput & {
    search?: string;
  };

export interface GetAnchorCommentTemplateGroupListRequest {
  page_num: number;
  page_size: number;
  org_id: string;
  filter?: AnchorCommentTemplateGroupListFilter;
  order_by?: Prisma.AnchorCommentTemplateGroupOrderByWithRelationInput;
}

export interface GetAnchorCommentTemplateGroupListResponseData {
  list: AnchorCommentTemplateGroup[];
  total: number;
}

export interface GetAnchorCommentTemplateGroupListResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: GetAnchorCommentTemplateGroupListResponseData;
}

export interface GetAnchorCommentTemplateGroupByIdRequest {
  org_id: string;
  id: string;
}

export type GetAnchorCommentTemplateGroupByIdResponseData = Omit<
  AnchorCommentTemplateGroup,
  'templates_count'
> & {
  templates: AnchorCommentTemplate[];
};

export interface GetAnchorCommentTemplateGroupByIdResponse {
  status_code: RESPONSE_CODE;
  data?: GetAnchorCommentTemplateGroupByIdResponseData;
  message?: string;
}

export interface DeleteAnchorCommentTemplateGroupRequest {
  ids: string[];
  org_id: string;
}

export interface DeleteAnchorCommentTemplateGroupResponse {
  status_code: RESPONSE_CODE;
  data: {
    deleted_count: number;
  };
  message?: string;
}

export interface ClearAnchorCommentTemplateGroupRequest {
  org_id: string;
  filter?: AnchorCommentTemplateGroupListFilter;
}

export interface ClearAnchorCommentTemplateGroupResponse {
  status_code: RESPONSE_CODE;
  data: {
    deleted_count: number;
  };
  message?: string;
}
