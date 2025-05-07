import type { Prisma } from '@tk-crawler/database';
import type { RangeFilter, RESPONSE_CODE, SortOrder } from '@tk-crawler/shared';
import type {
  AnchorRankLeague,
  CanUseInvitationType,
  DisplayedAnchorItem,
} from '../../anchor';
import type { Area } from '../../area';
import type { Region } from '../../region';

export interface GetAnchorListFilter {
  id?: string;
  user_id?: string;
  display_id?: string;
  invite_type?: CanUseInvitationType;
  rank_league?: RangeFilter<AnchorRankLeague>;
  area?: Area;
  region?: Region;
  tag?: string;
  has_commerce_goods?: boolean;
  follower_count?: RangeFilter;
  checked_result?: boolean;
  audience_count?: RangeFilter;
  current_diamonds?: RangeFilter;
  last_diamonds?: RangeFilter;
  highest_diamonds?: RangeFilter;
  checked_at?: RangeFilter<Date>;
  crawled_at?: RangeFilter<Date>;
  assign_to?: string | 'not_assigned' | 'assigned';
  contacted_by?: string | 'not_contacted' | 'contacted';
  room_id?: string;
  // TODO 主播来源 多账号风险
}

export type AnchorListWhereInput = Prisma.AnchorInviteCheckWhereInput;

export type GetAnchorListOrderBy =
  | { checked_at: SortOrder }
  | { crawled_at: SortOrder }
  | { display_id: SortOrder }
  | { user_id: SortOrder }
  | { follower_count: SortOrder }
  | { audience_count: SortOrder }
  | { current_diamonds: SortOrder }
  | { last_diamonds: SortOrder }
  | { highest_diamonds: SortOrder }
  | { area: SortOrder }
  | { region: SortOrder }
  | { checked_result: SortOrder }
  | { invite_type: SortOrder }
  | { rank_league: SortOrder }
  | { has_commerce_goods: SortOrder }
  | { tag: SortOrder }
  | { room_id: SortOrder }
  | { assign_to: SortOrder }
  | { contacted_by: SortOrder };

export type AnchorInviteCheckOrderByInput =
  Prisma.AnchorInviteCheckOrderByWithRelationInput;

export interface GetAnchorListRequest {
  page_num: number;
  page_size: number;
  filter?: GetAnchorListFilter;
  order_by?: GetAnchorListOrderBy;
  include_task_assign?: boolean;
  include_anchor_contact?: boolean;
}

export interface GetAnchorListResponseData {
  list: DisplayedAnchorItem[];
  total: number;
}

export interface GetAnchorListResponse {
  status_code: RESPONSE_CODE;
  data?: GetAnchorListResponseData;
  message?: string;
}

export interface ClearAnchorCheckRequest {
  filter?: GetAnchorListFilter;
}

export interface ClearAnchorCheckResponseData {
  deleted_count: number;
}

export interface ClearAnchorCheckResponse {
  status_code: RESPONSE_CODE;
  data?: ClearAnchorCheckResponseData;
  message?: string;
}

export interface GetAnchorListForDownloadRequest {
  filter?: GetAnchorListFilter;
  number?: number;
  order_by?: GetAnchorListOrderBy;
}

export interface GetAnchorListForDownloadResponseData {
  list: {
    user_id: string;
    display_id: string;
  }[];
}

export interface GetAnchorListForDownloadResponse {
  status_code: RESPONSE_CODE;
  data?: GetAnchorListForDownloadResponseData;
  message?: string;
}
