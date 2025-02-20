import {
  type ShouldUpdateAnchorRequest,
  type ShouldUpdateAnchorResponseData,
  ShouldUpdateAnchorResult,
} from '@tk-crawler/shared';
import { anchorId2TimestampMap } from './to-delete';

// 一小时之内爬到过就不更新
const UPDATE_INTERVAL = 1000 * 60 * 60;

export async function shouldUpdateAnchor({
  anchor_ids,
}: ShouldUpdateAnchorRequest): Promise<ShouldUpdateAnchorResponseData> {
  const result: ShouldUpdateAnchorResponseData = {};
  // TODO 从redis中获取记录来进行判断
  const now = Date.now();
  for (const anchor_id of anchor_ids) {
    if (
      !anchorId2TimestampMap.has(anchor_id) ||
      now - anchorId2TimestampMap.get(anchor_id)! > UPDATE_INTERVAL
    ) {
      result[anchor_id] = ShouldUpdateAnchorResult.NEED_UPDATE;
      anchorId2TimestampMap.set(anchor_id, now);
    } else {
      result[anchor_id] = ShouldUpdateAnchorResult.NO_NEED_UPDATE;
    }
  }
  return result;
}
