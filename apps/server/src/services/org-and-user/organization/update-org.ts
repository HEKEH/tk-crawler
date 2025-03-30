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
  const { regions, ...rest } = data;
  await mysqlClient.prismaClient.$transaction(async tx => {
    await tx.organization.update({
      where: {
        id: BigInt(rest.id),
      },
      data: omit(rest, ['id']),
    });
    if (regions && regions.length > 0) {
      await tx.orgRegionRelation.deleteMany({
        where: {
          org_id: BigInt(rest.id),
        },
      });
      await tx.orgRegionRelation.createMany({
        data: regions.map(region => ({
          org_id: BigInt(rest.id),
          region,
        })),
      });
    }
  });
}
