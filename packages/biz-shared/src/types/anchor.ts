import type { Area } from './area';
import type { OrgMemberItem } from './org-and-user';
import type { Region } from './region';

/** 被收集的主播信息 */
export interface CollectedAnchorInfo {
  user_id: string;
  display_id: string;
  room_id: string;
  // nickname: string;
  region: Region;
  follower_count: number;
  /** 直播间人数 */
  audience_count: number | null;
  // /** 直播间点赞数 */
  // like_count: number;
  /** 当前钻石 */
  current_diamonds: number;
  // /** 上次钻石 */
  // last_diamonds?: number;
  // /** 历史最高钻石 */
  // highest_diamonds?: number;
  /** 主播等级 */
  level: number | null;
  /** 主播直播段位 */
  rank_league: AnchorRankLeague | null;
  /** 是否有商品，由此判断是否带货主播 */
  has_commerce_goods: boolean;
  tag: string | null;
  // /** 是否可以签约 */
  // qualified: QualificationStatus;
}

export enum CanUseInvitationType {
  /** 普通邀约 */
  Regular = 3,
  /** 金票邀约 */
  Elite = 4,
}

export interface AnchorInviteCheckData {
  anchor_id: string;
  org_id: string;
  checked_by: string | null;
  /** true 代表可邀约，false 代表不可邀约 */
  checked_result: boolean;
  invite_type: CanUseInvitationType | null;
  checked_at: Date;
  area: Area;
}

export interface DisplayedAnchorItem
  extends CollectedAnchorInfo,
    Omit<AnchorInviteCheckData, 'anchor_id'> {
  id: string;
  last_diamonds: number | null;
  highest_diamonds: number;
  created_at: Date | string;
  updated_at: Date | string;
  crawled_at: Date | string;
  assigned_user?: Omit<OrgMemberItem, 'password'> | null;
  contacted_user?: Omit<OrgMemberItem, 'password'> | null;
}

export enum AnchorRankLeague {
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  B1 = 'B1',
  B2 = 'B2',
  B3 = 'B3',
  B4 = 'B4',
  B5 = 'B5',
  C1 = 'C1',
  C2 = 'C2',
  C3 = 'C3',
  C4 = 'C4',
  C5 = 'C5',
  D1 = 'D1',
  D2 = 'D2',
  D3 = 'D3',
  D4 = 'D4',
  D5 = 'D5',
}
