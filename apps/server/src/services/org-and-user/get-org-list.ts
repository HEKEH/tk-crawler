import type {
  GetOrgListRequest,
  GetOrgListResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';

export async function getOrgList(
  data: GetOrgListRequest,
): Promise<GetOrgListResponseData> {
  logger.info('[Get Org List]', { data });
  const [orgs, total] = await Promise.all([
    mysqlClient.prismaClient.organization.findMany({
      where: data.filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy: data.order_by,
    }),
    mysqlClient.prismaClient.organization.count({
      where: data.filter,
    }),
  ]);
  return {
    list: orgs.map(org => ({
      ...org,
      id: org.id.toString(),
    })),
    total,
  };
}
