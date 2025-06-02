import assert from 'node:assert';
import {
  getAdminFeaturesByRole,
  getAdminPrivilegesByRole,
  type SystemAdminUserRole,
  SystemAdminUserStatus,
  type SystemUserLoginRequest,
  type SystemUserLoginResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { simpleDecrypt } from '@tk-crawler/shared';
import config from '../../config';
import { logger } from '../../infra/logger';
import { BusinessError, generateToken, verifyPassword } from '../../utils';

export async function systemAdminUserLogin(
  request: SystemUserLoginRequest,
): Promise<SystemUserLoginResponseData> {
  logger.info('[System Admin User Login]', request);
  assert(request.username, '用户名不能为空');
  assert(request.password, '密码不能为空');
  const user = await mysqlClient.prismaClient.systemAdminUser.findUnique({
    where: {
      username: request.username,
    },
  });
  if (!user) {
    throw new BusinessError('用户不存在, 请重新登录');
  }
  const { password, role_id, ...rest } = user;
  const passwordDecrypted = simpleDecrypt(
    request.password,
    config.simplePasswordKey,
  );
  if (!(await verifyPassword(passwordDecrypted, password))) {
    throw new BusinessError('密码错误, 请重新登录');
  }

  if (user.status !== SystemAdminUserStatus.normal) {
    throw new BusinessError('用户已禁用, 请重新登录');
  }

  const token = await generateToken({
    userId: user.id.toString(),
  });
  return {
    user_info: {
      ...rest,
      id: rest.id.toString(),
      role_id: role_id as SystemAdminUserRole,
      privileges: getAdminPrivilegesByRole(role_id),
      features: getAdminFeaturesByRole(role_id),
      balance: rest.balance.toNumber(),
      discount: rest.discount.toNumber(),
    },
    token,
  };
}
