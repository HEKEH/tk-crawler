import type {
  GetOrgListRequest,
  GetOrgListResponseData,
  Region,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty } from '@tk-crawler/shared';
import dayjs from 'dayjs';
import { logger } from '../../../infra/logger';

export async function getOrgList(
  data: GetOrgListRequest,
): Promise<GetOrgListResponseData> {
  logger.info('[Get Org List]', { data });
  const _orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;
  const { user_count, ...orderBy } = _orderBy;
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
        regions: true,
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
    list: orgs.map(({ _count, regions, ...org }) => ({
      ...org,
      id: org.id.toString(),
      regions: regions.map(item => item.region as Region),
      if_membership_valid:
        Boolean(org.membership_expire_at) &&
        dayjs(org.membership_expire_at).isAfter(new Date()),
      user_count: _count.orgUsers,
    })),
    total,
  };
}
