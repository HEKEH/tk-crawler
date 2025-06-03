import type { Prisma } from '@tk-crawler/database';
import type { Logger } from '@tk-crawler/shared';
import {
  getAdminFeaturesByRole,
  type GetSystemAdminUserListFilter,
  type GetSystemAdminUserListRequest,
  type GetSystemAdminUserListResponseData,
  type SystemAdminUserWhereInput,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty } from '@tk-crawler/shared';

export function transformSystemAdminUserListValues(
  filterValues: GetSystemAdminUserListFilter = {},
): SystemAdminUserWhereInput {
  const { username, role_id, status } = filterValues;
  const where: SystemAdminUserWhereInput = {
    role_id,
    username: username ? { contains: username } : undefined,
    status,
  };
  return where;
}

export async function getSystemAdminUserList(
  data: GetSystemAdminUserListRequest,
  logger: Logger,
): Promise<GetSystemAdminUserListResponseData> {
  logger.info('[Get System Admin User List]', { data });
  const orderBy = isEmpty(data.order_by)
    ? [
        {
          role_id: 'asc' as const, // 默认按角色id排序，管理员优先
        },
        {
          id: 'asc' as const,
        },
      ]
    : data.order_by!;
  const where: Prisma.SystemAdminUserWhereInput =
    transformSystemAdminUserListValues(data.filter);
  const [systemAdminUsers, total] = await Promise.all([
    mysqlClient.prismaClient.systemAdminUser.findMany({
      where,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      omit: {
        password: true,
      },
    }),
    mysqlClient.prismaClient.systemAdminUser.count({
      where,
    }),
  ]);
  logger.info('[Get System Admin User List success]', {
    total,
  });
  logger.trace(systemAdminUsers);
  return {
    list: systemAdminUsers.map(systemAdminUser => ({
      ...systemAdminUser,
      id: systemAdminUser.id.toString(),
      features: getAdminFeaturesByRole(systemAdminUser.role_id),
      balance: systemAdminUser.balance.toNumber(),
      base_price: systemAdminUser.base_price,
      follow_price: systemAdminUser.follow_price,
    })),
    total,
  };
}
