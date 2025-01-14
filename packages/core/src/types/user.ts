import type { Region } from '@tk-crawler/shared';

export enum QualificationStatus {
  /** 未验证是否可以签约 */
  NOT_CHECKED = 0,
  /** 可以签约的 */
  QUALIFIED = 1,
  /** 无法签约的 */
  UNQUALIFIED = 2,
}

/** 被收集的主播信息 */
export interface CollectedUserInfo {
  id: string;
  display_id: string;
  nickname: string;
  bio_description: string;
  region: Region;
  /** 是否可以签约 */
  qualified: QualificationStatus;
}
