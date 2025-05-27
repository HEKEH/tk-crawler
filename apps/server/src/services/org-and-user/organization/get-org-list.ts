import type {
  Area,
  GetOrgListRequest,
  GetOrgListResponseData,
  SystemAdminUserInfo,
  SystemAdminUserRole,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { AdminFeature } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty } from '@tk-crawler/shared';
import dayjs from 'dayjs';

export async function getOrgList(
  data: GetOrgListRequest,
  user_info: SystemAdminUserInfo,
  options: {
    include_owner_info?: boolean;
  },
  logger: Logger,
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
  let filter = data.filter;
  if (user_info.features.includes(AdminFeature.ONLY_OWN_ORG)) {
    filter = {
      ...filter,
      owner_id: BigInt(user_info.id),
    };
  }
  const [orgs, total] = await Promise.all([
    mysqlClient.prismaClient.organization.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      include: {
        areas: {
          select: {
            area: true,
          },
        },
        owner: options.include_owner_info,
        _count: {
          select: {
            orgUsers: true,
          },
        },
      },
    }),
    mysqlClient.prismaClient.organization.count({
      where: filter,
    }),
  ]);
  return {
    list: orgs.map(({ _count, areas, ...org }) => ({
      ...org,
      id: org.id.toString(),
      areas: areas.map(item => item.area as Area),
      if_membership_valid:
        Boolean(org.membership_expire_at) &&
        dayjs(org.membership_expire_at).isAfter(new Date()),
      user_count: _count.orgUsers,
      owner: org.owner
        ? {
            ...org.owner,
            id: org.owner.id.toString(),
            role_id: org.owner.role_id as SystemAdminUserRole,
          }
        : undefined,
    })),
    total,
  };
}
