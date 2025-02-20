import {
  type ShouldUpdateAnchorRequest,
  type ShouldUpdateAnchorResponseData,
  ShouldUpdateAnchorResult,
} from '@tk-crawler/shared';
import { ANCHOR_CRAWL_OUTDATE_TIME } from './constants';
import { anchorCrawlRecordRedisNamespace } from './redis-namespaces';

export async function shouldUpdateAnchor({
  anchor_ids,
}: ShouldUpdateAnchorRequest): Promise<ShouldUpdateAnchorResponseData> {
  const result: ShouldUpdateAnchorResponseData = {};
  const crawlRecord = await anchorCrawlRecordRedisNamespace.mget(anchor_ids);
  const toRecordIds: Array<string> = [];
  anchor_ids.forEach((anchor_id, index) => {
    const record = crawlRecord[index];
    result[anchor_id] = record
      ? ShouldUpdateAnchorResult.NO_NEED_UPDATE
      : ShouldUpdateAnchorResult.NEED_UPDATE;
    if (!record) {
      toRecordIds.push(anchor_id);
    }
  });
  /** 记录开始爬取的时间 */
  await anchorCrawlRecordRedisNamespace.mset(
    toRecordIds.map(id => [id, 1]),
    ANCHOR_CRAWL_OUTDATE_TIME,
  );
  return result;
}
