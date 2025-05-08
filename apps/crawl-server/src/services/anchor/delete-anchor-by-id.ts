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

export async function deleteAnchorByDisplayIds(data: {
  display_ids: string[];
}): Promise<void> {
  logger.info(
    `[delete-anchor-by-display-id] delete anchor by display id: ${data.display_ids}`,
  );
  const result = await mysqlClient.prismaClient.anchor.deleteMany({
    where: {
      display_id: {
        in: data.display_ids,
      },
    },
  });
  logger.trace(
    `[delete-anchor-by-display-id] delete anchor by display id result: ${beautifyJsonStringify(result)}`,
  );
}
