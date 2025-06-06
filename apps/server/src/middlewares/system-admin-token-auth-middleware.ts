import type { AdminPrivilege } from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  hasAdminPrivilege,
  SYSTEM_TOKEN_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { getSystemAdminUserInfoByToken } from '../services';
import { BusinessError } from '../utils';

/** Token authentication */
export function systemAdminTokenAuthMiddleware(options?: {
  fetchPassword?: boolean;
}) {
  return async (ctx: Context, next: Next) => {
    const token = ctx.request.headers[SYSTEM_TOKEN_HEADER_KEY];
    ctx.logger.trace('[systemAdminTokenAuthMiddleware token]', token);
    const systemUserInfo = await getSystemAdminUserInfoByToken(token, options);
    ctx.logger.info('[systemAdminTokenAuthMiddleware systemUserInfo]', {
      user_id: systemUserInfo.user_info.id,
      username: systemUserInfo.user_info.username,
    });
    Object.defineProperty(ctx, 'systemUserInfo', {
      get() {
        return systemUserInfo;
      },
    });
    await next();
  };
}

export function systemAdminHasPrivilegeMiddleware(options: {
  privilege: AdminPrivilege;
}) {
  return async (ctx: Context, next: Next) => {
    const systemUserInfo = ctx.systemUserInfo;
    if (!systemUserInfo) {
      throw new BusinessError('请先登录');
    }
    if (
      !hasAdminPrivilege(systemUserInfo.user_info.role_id, options.privilege)
    ) {
      throw new BusinessError('您没有权限');
    }
    await next();
  };
}
