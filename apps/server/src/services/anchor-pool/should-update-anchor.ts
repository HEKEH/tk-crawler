import type {
  ShouldUpdateAnchorRequest,
  ShouldUpdateAnchorResponseData,
} from '@tk-crawler/shared';
import { anchorId2TimestampMap } from './to-delete';

const UPDATE_INTERVAL = 1000 * 60 * 60;
// 一小时之内爬到过就不更新

export async function shouldUpdateAnchor({
  anchor_id,
}: ShouldUpdateAnchorRequest): Promise<ShouldUpdateAnchorResponseData> {
  // TODO 从redis中获取记录来进行判断
  if (!anchorId2TimestampMap.has(anchor_id)) {
    return 1;
  }
  const timestamp = anchorId2TimestampMap.get(anchor_id)!;
  const now = Date.now();
  return now - timestamp < UPDATE_INTERVAL ? 0 : 1;
}
