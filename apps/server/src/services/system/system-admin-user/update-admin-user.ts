import type { UpdateSystemAdminUserRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError, hashPassword } from '../../../utils';

export async function updateSystemAdminUser(
  { data: _data }: UpdateSystemAdminUserRequest,
  logger: Logger,
): Promise<void> {
  const data = {
    ..._data,
    username: _data.username?.trim(),
  };
  const { password, id, ...rest } = data;
  if (rest.username) {
    const usernameFind =
      await mysqlClient.prismaClient.systemAdminUser.findFirst({
        select: { id: true },
        where: { username: rest.username, id: { not: BigInt(id) } },
      });
    if (usernameFind) {
      throw new BusinessError('登录名已存在');
    }
  }
  const user = await mysqlClient.prismaClient.systemAdminUser.findUnique({
    where: { id: BigInt(id) },
  });
  if (!user) {
    throw new BusinessError('用户不存在');
  }
  let updateData;
  if (password) {
    const hashedPassword = await hashPassword(password);
    updateData = { ...rest, password: hashedPassword };
    logger.info('[Update System Admin User]', {
      data: { ...rest, id, password: '******' },
    });
  } else {
    updateData = rest;
    logger.info('[Update System Admin User]', { data });
  }
  await mysqlClient.prismaClient.systemAdminUser.update({
    where: {
      id: BigInt(id),
    },
    data: updateData,
  });
}
