import type { CollectedAnchorInfo } from '../anchor';

export enum TKRequestMessage {
  TIKTOK_COOKIE_OUTDATED = 'TIKTOK_COOKIE_OUTDATED',
  ANCHOR_UPDATED = 'ANCHOR_UPDATED',
  ANCHORS_CRAWLED_NUMBER = 'ANCHORS_CRAWLED_NUMBER',
  REQUEST_ERROR = 'REQUEST_ERROR',
}

export interface AnchorCrawledMessage {
  anchor: CollectedAnchorInfo;
}
