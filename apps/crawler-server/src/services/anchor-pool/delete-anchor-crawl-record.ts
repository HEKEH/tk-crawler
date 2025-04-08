import type { DeleteAnchorCrawlRecordRequest } from '@tk-crawler/biz-shared';
import { anchorCrawlRecordRedisNamespace } from './redis-namespaces';

export async function deleteAnchorCrawlRecord({
  anchor_id,
}: DeleteAnchorCrawlRecordRequest) {
  await anchorCrawlRecordRedisNamespace.del(anchor_id);
}
