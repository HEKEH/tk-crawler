import type {
  SystemAdminUser,
  SystemUserChangePasswordRequest,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { simpleDecrypt } from '@tk-crawler/shared';
import config from '../../config';
import { logger } from '../../infra/logger';
import { BusinessError, hashPassword, verifyPassword } from '../../utils';

export async function changeSystemUserPassword(
  data: SystemUserChangePasswordRequest,
  user: { user_info: Required<SystemAdminUser['user_info']> },
): Promise<void> {
  logger.info('[Change Password]', data);
  const old_password = simpleDecrypt(
    data.old_password,
    config.simplePasswordKey,
  );
  const new_password = simpleDecrypt(
    data.new_password,
    config.simplePasswordKey,
  );
  if (!(await verifyPassword(old_password, user.user_info.password))) {
    throw new BusinessError('当前密码输入错误, 请重新输入');
  }
  const hashedPassword = await hashPassword(new_password);
  await mysqlClient.prismaClient.systemAdminUser.update({
    where: {
      id: BigInt(user.user_info.id),
    },
    data: {
      password: hashedPassword,
    },
  });
}
