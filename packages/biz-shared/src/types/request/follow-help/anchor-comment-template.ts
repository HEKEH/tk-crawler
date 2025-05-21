import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

import type { AnchorCommentTemplate } from '../../follow-help';

export interface CreateAnchorCommentTemplateRequest {
  group_id: string;
  templates: Omit<
    AnchorCommentTemplate,
    'id' | 'group_id' | 'created_at' | 'updated_at' | 'org_id'
  >[];
}

export interface CreateAnchorCommentTemplateResponse {
  status_code: RESPONSE_CODE;
  data?: {
    ids: string[];
  };
  message?: string;
}

export interface UpdateAnchorCommentTemplateRequest {
  template: Partial<
    Omit<
      AnchorCommentTemplate,
      'id' | 'group_id' | 'created_at' | 'updated_at' | 'org_id'
    >
  > & {
    id: string;
  };
}

export interface UpdateAnchorCommentTemplateResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type AnchorCommentTemplateWhereInput =
  Prisma.AnchorCommentTemplateWhereInput;

export type AnchorCommentTemplateListFilter =
  AnchorCommentTemplateWhereInput & {
    search?: string;
  };

export interface GetAnchorCommentTemplateListRequest {
  page_num: number;
  page_size: number;
  filter?: AnchorCommentTemplateListFilter;
  order_by?: Prisma.AnchorCommentTemplateOrderByWithRelationInput;
}

export interface GetAnchorCommentTemplateListResponseData {
  list: AnchorCommentTemplate[];
  total: number;
}

export interface GetAnchorCommentTemplateListResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: GetAnchorCommentTemplateListResponseData;
}

export interface DeleteAnchorCommentTemplateRequest {
  ids: string[];
}

export interface DeleteAnchorCommentTemplateResponse {
  status_code: RESPONSE_CODE;
  data: {
    deleted_count: number;
  };
  message?: string;
}

export interface ClearAnchorCommentTemplateRequest {
  filter?: AnchorCommentTemplateListFilter;
}

export interface ClearAnchorCommentTemplateResponse {
  status_code: RESPONSE_CODE;
  data?: {
    deleted_count: number;
  };
  message?: string;
}
