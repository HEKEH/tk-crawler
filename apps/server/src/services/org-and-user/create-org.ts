import type { CreateOrgRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';

export async function createOrg(data: CreateOrgRequest): Promise<void> {
  logger.info('[Create Org]', { data });
  await mysqlClient.prismaClient.organization.create({
    data,
  });
}
