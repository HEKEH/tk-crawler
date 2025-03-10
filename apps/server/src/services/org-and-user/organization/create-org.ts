import type { CreateOrgRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError } from '../../../utils';
import { checkOrgExist } from './check-org-exist';

export async function createOrg(data: CreateOrgRequest): Promise<void> {
  logger.info('[Create Org]', { data });
  if (await checkOrgExist(data.name)) {
    throw new BusinessError('组织名称已存在');
  }
  await mysqlClient.prismaClient.organization.create({
    data,
  });
}
