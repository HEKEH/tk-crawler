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
  id: string;
  display_id: string;
  // nickname: string;
  region: Region;
  follower_count: number;
  /** 直播间人数 */
  audience_count: number;
  // /** 直播间点赞数 */
  // like_count: number;
  /** 当前钻石 */
  current_diamond: number;
  // /** 上次钻石 */
  // last_diamond: number;
  // /** 历史最高钻石 */
  // highest_diamond: number;
  /** 主播等级 */
  level?: number;
  /** 主播直播段位 */
  rank_league: string;
  live_label?: string;
  // /** 是否可以签约 */
  // qualified: QualificationStatus;
}
