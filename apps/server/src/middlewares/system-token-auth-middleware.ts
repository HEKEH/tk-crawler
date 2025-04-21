import type { Context, Next } from 'koa';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { logger } from '../infra/logger';
import { getSystemUserInfoByToken } from '../services';

/** Token authentication */
export function systemTokenAuthMiddleware(options?: {
  fetchPassword?: boolean;
}) {
  return async (ctx: Context, next: Next) => {
    const token =
      ctx.request.headers[SYSTEM_TOKEN_HEADER_KEY] ||
      ctx.getRequestData<{ [SYSTEM_TOKEN_HEADER_KEY]: string }>()[
        SYSTEM_TOKEN_HEADER_KEY
      ];
    logger.trace('[systemTokenAuthMiddleware token]', token);
    const systemUserInfo = await getSystemUserInfoByToken(token, options);
    Object.defineProperty(ctx, 'systemUserInfo', {
      get() {
        return systemUserInfo;
      },
    });
    await next();
  };
}
