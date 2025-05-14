import type { Context, Next } from 'koa';
import { OrgMemberRole } from '@tk-crawler/biz-shared';
import { BusinessError } from '../utils';

export async function checkIsAdminClientMiddleware(ctx: Context, next: Next) {
  const { user_info } = ctx.clientInfo!;
  if (user_info.role_id !== OrgMemberRole.admin) {
    ctx.logger.error(
      `[checkIsAdminClientMiddleware] user_info: ${JSON.stringify(
        user_info,
      )} is not admin`,
    );
    throw new BusinessError('您没有权限');
  }
  await next();
}
