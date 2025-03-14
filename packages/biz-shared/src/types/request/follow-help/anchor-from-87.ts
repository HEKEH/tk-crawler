import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

import type { AnchorFrom87 } from '../../follow-help';

export type CreateOrUpdateAnchorFrom87Request = Omit<
  AnchorFrom87,
  'has_grouped' | 'id' | 'created_at' | 'updated_at'
>[];

export interface CreateOrUpdateAnchorFrom87Response {
  status_code: RESPONSE_CODE;
  data?: {
    created_count: number;
    updated_count: number;
  };
  message?: string;
}

export interface GetAnchorFrom87ListRequest {
  page_num: number;
  page_size: number;
  filter?: Prisma.AnchorFrom87WhereInput;
  order_by?: Prisma.AnchorFrom87OrderByWithRelationInput;
}

export interface GetAnchorFrom87ListResponseData {
  list: AnchorFrom87[];
  total: number;
}

export interface GetAnchorFrom87ListResponse {
  status_code: RESPONSE_CODE;
  message?: string;
  data?: GetAnchorFrom87ListResponseData;
}

export interface DeleteAnchorFrom87Request {
  id: string[];
}

export interface DeleteAnchorFrom87Response {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface ClearAnchorFrom87Request {
  filter?: Prisma.AnchorFrom87WhereInput;
}

export interface ClearAnchorFrom87Response {
  status_code: RESPONSE_CODE;
  message?: string;
}
