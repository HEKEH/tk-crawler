import type { RecordAnchorCrawlRequest } from '@tk-crawler/shared';
import { anchorId2TimestampMap } from './to-delete';

export async function recordAnchorCrawl({
  anchor_id,
}: RecordAnchorCrawlRequest) {
  // TODO redis
  const now = Date.now();
  anchorId2TimestampMap.set(anchor_id, now);
}
