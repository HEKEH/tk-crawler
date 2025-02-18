import type { DeleteAnchorCrawlRecordRequest } from '@tk-crawler/shared';
import { anchorId2TimestampMap } from './to-delete';

export async function deleteAnchorCrawlRecord({
  anchor_id,
}: DeleteAnchorCrawlRecordRequest) {
  // TODO redis
  anchorId2TimestampMap.delete(anchor_id);
}
