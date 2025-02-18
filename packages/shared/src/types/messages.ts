import type { CollectedAnchorInfo } from './anchor';

export enum CrawlerMessage {
  TIKTOK_COOKIE_OUTDATED = 'TIKTOK_COOKIE_OUTDATED',
  ANCHOR_SCRAWLED = 'ANCHOR_SCRAWLED',
  REQUEST_ERROR = 'REQUEST_ERROR',
}

export interface AnchorScrawledMessage {
  anchor: CollectedAnchorInfo;
}
