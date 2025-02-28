import type { Region } from './region';

export enum QualificationStatus {
  /** 未验证是否可以签约 */
  NOT_CHECKED = 0,
  /** 可以签约的 */
  QUALIFIED = 1,
  /** 无法签约的 */
  UNQUALIFIED = 2,
}

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
  rank_league: string | null;
  /** 是否有商品，由此判断是否带货主播 */
  has_commerce_goods: boolean | null;
  tag: string | null;
  // /** 是否可以签约 */
  // qualified: QualificationStatus;
}
