import type { Context, Next } from 'koa';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { logger } from '../infra/logger';
import { getOrgMemberInfoByToken } from '../services/auth/get-org-member-info-by-token';

/** Token authentication */
export async function clientTokenAuthMiddleware(ctx: Context, next: Next) {
  const token =
    ctx.request.headers[CLIENT_TOKEN_HEADER_KEY] ||
    ctx.getRequestData<{ [CLIENT_TOKEN_HEADER_KEY]: string }>()[
      CLIENT_TOKEN_HEADER_KEY
    ];
  logger.trace('tokenAuthMiddleware token', token);
  const clientInfo = await getOrgMemberInfoByToken(token);
  Object.defineProperty(ctx, 'clientInfo', {
    get() {
      return clientInfo;
    },
  });
  await next();
}
