import type { DeleteOrgRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';

export async function deleteOrg(data: DeleteOrgRequest): Promise<void> {
  logger.info('[Delete Org]', { data });
  await mysqlClient.prismaClient.organization.delete({
    where: {
      id: BigInt(data.id),
    },
  });
}
