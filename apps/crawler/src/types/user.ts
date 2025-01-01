import type { Region } from './region';

/** 被收集的主播信息 */
export interface CollectedUserInfo {
  id: string;
  display_id: string;
  nickname: string;
  bio_description: string;
  region: Region;
}
