import type { UpdateOrgRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { omit } from 'lodash';
import { logger } from '../../../infra/logger';
import { BusinessError } from '../../../utils';

export async function updateOrg(data: UpdateOrgRequest): Promise<void> {
  logger.info('[Update Org]', { data });
  if (data.name) {
    const orgNameFind = await mysqlClient.prismaClient.organization.findFirst({
      select: { id: true },
      where: { name: data.name, id: { not: BigInt(data.id) } },
    });
    if (orgNameFind) {
      throw new BusinessError('组织名称已存在');
    }
  }
  await mysqlClient.prismaClient.organization.update({
    where: {
      id: BigInt(data.id),
    },
    data: omit(data, ['id']),
  });
}
