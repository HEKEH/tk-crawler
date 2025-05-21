import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE, SortOrder } from '@tk-crawler/shared';

import type {
  AnchorCommentTemplate,
  AnchorCommentTemplateGroup,
} from '../../follow-help';

export interface CreateAnchorCommentTemplateGroupRequest {
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

export type GetAnchorCommentTemplateGroupListOrderBy =
  Prisma.AnchorCommentTemplateGroupOrderByWithRelationInput & {
    templates_count?: SortOrder;
  };

export interface GetAnchorCommentTemplateGroupListRequest {
  page_num: number;
  page_size: number;
  filter?: AnchorCommentTemplateGroupListFilter;
  order_by?: GetAnchorCommentTemplateGroupListOrderBy;
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
}

export interface DeleteAnchorCommentTemplateGroupResponse {
  status_code: RESPONSE_CODE;
  data?: {
    deleted_ids: string[];
    deleted_count: number;
  };
  message?: string;
}

export interface ClearAnchorCommentTemplateGroupRequest {
  filter?: AnchorCommentTemplateGroupListFilter;
}

export interface ClearAnchorCommentTemplateGroupResponse {
  status_code: RESPONSE_CODE;
  data?: {
    deleted_ids: string[];
    deleted_count: number;
  };
  message?: string;
}
