import { mysqlClient } from '@tk-crawler/database';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

export async function deleteAnchorById(data: {
  user_id: string;
}): Promise<void> {
  logger.info(`[delete-anchor-by-id] delete anchor by id: ${data.user_id}`);
  const result = await mysqlClient.prismaClient.anchor.delete({
    where: {
      user_id: BigInt(data.user_id),
    },
  });
  logger.trace(
    `[delete-anchor-by-id] delete anchor by id result: ${beautifyJsonStringify(result)}`,
  );
}
