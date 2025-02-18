import type { CollectedAnchorInfo } from './anchor';

export enum CrawlerMessage {
  TIKTOK_COOKIE_OUTDATED = 'TIKTOK_COOKIE_OUTDATED',
  ANCHOR_SCRAWLED = 'ANCHOR_SCRAWLED',
  TIKTOK_REQUEST_ECONNRESET = 'TIKTOK_REQUEST_ECONNRESET',
}

export interface AnchorScrawledMessage {
  anchor: CollectedAnchorInfo;
}
