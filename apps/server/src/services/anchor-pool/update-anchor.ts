import type { UpdateAnchorRequest } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

export async function updateAnchor(data: UpdateAnchorRequest) {
  logger.info('[UpdateAnchor]', { data });
  // TODO 更新到数据库
}
