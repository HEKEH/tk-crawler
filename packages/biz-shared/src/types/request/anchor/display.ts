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
  updated_at?: RangeFilter<Date>;
  // TODO 主播来源 多账号风险 分配状态 建联状态
}

export type AnchorListWhereInput = Prisma.AnchorInviteCheckWhereInput;

export type GetAnchorListOrderBy =
  | { updated_at: SortOrder }
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
  | { room_id: SortOrder };

export type AnchorInviteCheckOrderByInput =
  Prisma.AnchorInviteCheckOrderByWithRelationInput;

export interface GetAnchorListRequest {
  page_num: number;
  page_size: number;
  filter?: GetAnchorListFilter;
  order_by?: GetAnchorListOrderBy;
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
