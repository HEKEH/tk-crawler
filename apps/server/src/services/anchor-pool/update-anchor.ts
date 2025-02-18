import type { UpdateAnchorRequest } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';
import { anchorId2TimestampMap } from './to-delete';

export async function updateAnchor(data: UpdateAnchorRequest) {
  logger.info('[UpdateAnchor]', { data });
  const { user_id } = data;
  const now = Date.now();
  anchorId2TimestampMap.set(user_id, now);
  // TODO 更新到数据库
}
