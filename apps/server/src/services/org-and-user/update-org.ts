import type { UpdateOrgRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { omit } from 'lodash';
import { logger } from '../../infra/logger';

export async function updateOrg(data: UpdateOrgRequest): Promise<void> {
  logger.info('[Update Org]', { data });
  await mysqlClient.prismaClient.organization.update({
    where: {
      id: BigInt(data.id),
    },
    data: omit(data, ['id']),
  });
}
