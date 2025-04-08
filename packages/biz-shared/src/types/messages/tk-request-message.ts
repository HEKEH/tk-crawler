import type { CollectedAnchorInfo } from '../anchor';

export enum TKRequestMessage {
  TIKTOK_COOKIE_OUTDATED = 'TIKTOK_COOKIE_OUTDATED',
  ANCHOR_CRAWLED = 'ANCHOR_CRAWLED',
  REQUEST_ERROR = 'REQUEST_ERROR',
}

export interface AnchorCrawledMessage {
  anchor: CollectedAnchorInfo;
}
