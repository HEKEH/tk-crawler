import type { UpdateAnchorRequest } from '@tk-crawler/shared';
import { mysqlClient } from '@tk-crawler/database/mysql';
import { logger } from '../../infra/logger';

export async function updateAnchor(data: UpdateAnchorRequest) {
  logger.info('[UpdateAnchor]', { data });
  await mysqlClient.updateAnchor(data);
}
