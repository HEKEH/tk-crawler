import type { Prisma } from '.prisma/client';
import type { RESPONSE_CODE } from '@tk-crawler/shared';

import type { AnchorFrom87, AnchorFrom87RawData } from '../../follow-help';

export interface CreateOrUpdateAnchorFrom87Request {
  list: AnchorFrom87RawData[];
  org_id: string;
}

export interface CreateOrUpdateAnchorFrom87Response {
  status_code: RESPONSE_CODE;
  data?: {
    created_count: number;
    updated_count: number;
  };
  message?: string;
}

export type AnchorFrom87WhereInput = Prisma.AnchorFrom87WhereInput;

export type AnchorFrom87ListFilter = AnchorFrom87WhereInput & {
  has_grouped?: boolean;
  search?: string;
};

export interface GetAnchorFrom87ListRequest {
  page_num: number;
  page_size: number;
  org_id: string;
  filter: AnchorFrom87ListFilter;
  order_by?: Prisma.AnchorFrom87OrderByWithRelationInput;
  search?: string;
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
  org_id: string;
}

export interface DeleteAnchorFrom87Response {
  status_code: RESPONSE_CODE;
  data: {
    deleted_count: number;
  };
  message?: string;
}

export interface ClearAnchorFrom87Request {
  filter?: AnchorFrom87ListFilter;
  org_id: string;
}

export interface ClearAnchorFrom87Response {
  status_code: RESPONSE_CODE;
  data: {
    deleted_count: number;
  };
  message?: string;
}
