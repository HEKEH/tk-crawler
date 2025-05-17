import type { DeleteSystemAdminUserRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError } from '../../../utils';

export async function deleteSystemAdminUser(
  data: DeleteSystemAdminUserRequest,
  logger: Logger,
): Promise<void> {
  logger.info('[Delete System Admin User]', { data });
  const { id } = data;
  const systemAdminUser =
    await mysqlClient.prismaClient.systemAdminUser.findUnique({
      where: {
        id: BigInt(id),
      },
    });
  if (!systemAdminUser) {
    throw new BusinessError('用户不存在');
  }
  await mysqlClient.prismaClient.systemAdminUser.delete({
    where: {
      id: BigInt(id),
    },
  });
}
