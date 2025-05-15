import type {
  Area,
  GetAllTKGuildUserListRequest,
  GetAllTKGuildUserListResponseData,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty, transObjectValuesToString } from '@tk-crawler/shared';
import { transformTKGuildUserFilterValues } from './filter';

// Get All TK Guild User list
export async function getAllTKGuildUserList(
  data: GetAllTKGuildUserListRequest,
  logger: Logger,
): Promise<GetAllTKGuildUserListResponseData> {
  logger.info('[Get All TK Guild User List] Request', data);

  const _orderBy = isEmpty(data.order_by)
    ? {
        id: 'asc' as const,
      }
    : data.order_by!;

  const filter = transformTKGuildUserFilterValues(data.filter);

  const [users, total] = await Promise.all([
    mysqlClient.prismaClient.liveAdminUser.findMany({
      where: filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy: _orderBy,
      omit: {
        cookie: true,
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    }),
    mysqlClient.prismaClient.liveAdminUser.count({
      where: filter,
    }),
  ]);
  logger.info(`[Get All TK Guild User List] Response`, {
    total,
  });

  return {
    list: users.map(({ area, ...user }) => {
      const { organization, ...rest } = user;
      return {
        ...transObjectValuesToString(rest, ['id', 'org_id']),
        area: area as Area,
        org_name: organization?.name,
      };
    }),
    total,
  };
}
