import type { CreateOrgRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError } from '../../../utils';
import { checkOrgNameExist } from './check-org-name-exist';

export async function createOrg(data: CreateOrgRequest): Promise<void> {
  logger.info('[Create Org]', { data });
  if (await checkOrgNameExist(data.name)) {
    throw new BusinessError('组织名称已存在');
  }
  await mysqlClient.prismaClient.organization.create({
    data,
  });
}
