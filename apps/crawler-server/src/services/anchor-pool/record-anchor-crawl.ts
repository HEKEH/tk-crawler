import type { RecordAnchorCrawlRequest } from '@tk-crawler/biz-shared';
import { ANCHOR_CRAWL_OUTDATE_TIME } from './constants';
import { anchorCrawlRecordRedisNamespace } from './redis-namespaces';

export async function recordAnchorCrawl({
  anchor_id,
}: RecordAnchorCrawlRequest) {
  anchorCrawlRecordRedisNamespace.set(anchor_id, 1, ANCHOR_CRAWL_OUTDATE_TIME);
}
