import type { CreateSystemAdminUserRequest } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError, hashPassword } from '../../../utils';
import { checkAdminUserNameExist } from './check-admin-user-name-exist';

export async function createSystemAdminUser(
  data: CreateSystemAdminUserRequest,
  logger: Logger,
): Promise<void> {
  const { password, ...rest } = data;
  rest.username = rest.username?.trim();
  assert(rest.username, 'username is required');
  assert(password, 'password is required');
  logger.info('[Create System Admin User]', {
    data: { ...rest, password: '******' },
  });
  const username = rest.username;
  if (await checkAdminUserNameExist(username)) {
    throw new BusinessError('登录名已存在');
  }
  const hashedPassword = await hashPassword(password);
  await mysqlClient.prismaClient.systemAdminUser.create({
    data: {
      ...rest,
      password: hashedPassword,
    },
  });
}
