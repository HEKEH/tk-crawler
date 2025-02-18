import type { CollectedAnchorInfo } from './anchor';

export enum CrawlerMessage {
  TIKTOK_COOKIE_OUTDATED = 'TIKTOK_COOKIE_OUTDATED',
  ANCHOR_SCRAWLED = 'ANCHOR_SCRAWLED',
  TIKTOK_REQUEST_ECONNRESET_OR_TIMEOUT = 'TIKTOK_REQUEST_ECONNRESET_OR_TIMEOUT',
}

export interface AnchorScrawledMessage {
  anchor: CollectedAnchorInfo;
}
