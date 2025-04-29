import type { Context, Next } from 'koa';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
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
    ctx.logger.trace('[systemTokenAuthMiddleware token]', token);
    const systemUserInfo = await getSystemUserInfoByToken(token, options);
    ctx.logger.info('[systemTokenAuthMiddleware systemUserInfo]', {
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
