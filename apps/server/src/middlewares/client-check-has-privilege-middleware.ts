import type { ClientPrivilege } from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { hasClientPrivilege } from '@tk-crawler/biz-shared';
import { BusinessError } from '../utils';

export function clientHasPrivilegeMiddleware(options: {
  privilege: ClientPrivilege;
}) {
  return async (ctx: Context, next: Next) => {
    const clientInfo = ctx.clientInfo;
    if (!clientInfo) {
      throw new BusinessError('请先登录');
    }
    if (!hasClientPrivilege(clientInfo.user_info.role_id, options.privilege)) {
      throw new BusinessError('您没有权限');
    }
    await next();
  };
}
