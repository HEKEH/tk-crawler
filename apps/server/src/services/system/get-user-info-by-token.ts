import {
  getAdminPrivilegesByRole,
  type SystemAdminUser,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError, parseToken, TokenInvalidError } from '../../utils';

/** jwt token登录 */
export async function getSystemAdminUserInfoByToken(
  token: string | any | undefined,
  options?: {
    fetchPassword?: boolean;
  },
): Promise<SystemAdminUser> {
  if (!token) {
    throw new BusinessError('Token不能为空');
  }
  if (typeof token !== 'string') {
    throw new BusinessError('Token必须为字符串');
  }
  const { userId, expires } = (() => {
    try {
      return parseToken(token);
    } catch {
      throw new TokenInvalidError('Token无效，请重新登录');
    }
  })();
  if (!userId || !expires) {
    throw new TokenInvalidError('Token无效，请重新登录');
  }
  if (expires < Date.now()) {
    throw new TokenInvalidError('Token已过期，请重新登录');
  }
  const user = await mysqlClient.prismaClient.systemAdminUser.findUnique({
    where: {
      id: BigInt(userId),
    },
    omit: {
      password: !options?.fetchPassword,
    },
  });
  if (!user) {
    throw new TokenInvalidError('用户不存在, 请重新登录');
  }

  return {
    user_info: {
      id: user.id.toString(),
      username: user.username,
      password: user.password,
      role_id: user.role_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      privileges: getAdminPrivilegesByRole(user.role_id),
    },
  };
}
