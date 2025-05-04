import type { Context, Next } from 'koa';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { getOrgMemberInfoByToken } from '../services/auth/get-org-member-info-by-token';

/** Token authentication */
export function clientTokenAuthMiddleware(options?: {
  fetchPassword?: boolean;
}) {
  return async (ctx: Context, next: Next) => {
    const token = ctx.request.headers[CLIENT_TOKEN_HEADER_KEY];
    ctx.logger.trace('[clientTokenAuthMiddleware token]', token);
    const clientInfo = await getOrgMemberInfoByToken(token, options);
    ctx.logger.info('[clientTokenAuthMiddleware clientInfo]', {
      user_id: clientInfo.user_info.id,
      username: clientInfo.user_info.username,
      org_id: clientInfo.org_info.id,
      org_name: clientInfo.org_info.name,
    });
    Object.defineProperty(ctx, 'clientInfo', {
      get() {
        return clientInfo;
      },
    });
    await next();
  };
}
