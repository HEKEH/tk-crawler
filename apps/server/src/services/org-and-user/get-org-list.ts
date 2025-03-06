import type {
  GetOrgListRequest,
  GetOrgListResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { logger } from '../../infra/logger';

export async function getOrgList(
  data: GetOrgListRequest,
): Promise<GetOrgListResponseData> {
  logger.info('[Get Org List]', { data });
  const { user_count, ...orderBy } = data.order_by ?? {};
  if (user_count) {
    orderBy.orgUsers = {
      _count: user_count,
    };
  }
  const [orgs, total] = await Promise.all([
    mysqlClient.prismaClient.organization.findMany({
      where: data.filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        _count: {
          select: {
            orgUsers: true,
          },
        },
      },
    }),
    mysqlClient.prismaClient.organization.count({
      where: data.filter,
    }),
  ]);
  return {
    list: orgs.map(org => ({
      ...org,
      id: org.id.toString(),
      if_membership_valid:
        Boolean(org.membership_expire_at) &&
        dayjs(org.membership_expire_at).isAfter(new Date()),
      user_count: org._count.orgUsers,
    })),
    total,
  };
}
