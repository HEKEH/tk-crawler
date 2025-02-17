import type { Context, Next } from 'koa';
import { TOKEN_HEADER_KEY } from '@tk-crawler/shared';
import { logger } from '../infra/logger';
import { authToken } from '../services/auth-token';
import { BusinessError } from '../utils';

/** Token authentication */
export async function tokenAuthMiddleware(ctx: Context, next: Next) {
  const token =
    ctx.request.headers[TOKEN_HEADER_KEY] ||
    ctx.getRequestData<{ [TOKEN_HEADER_KEY]: string }>()[TOKEN_HEADER_KEY];
  logger.trace('tokenAuthMiddleware token', token);
  if (!token) {
    throw new BusinessError('Token is required');
  }
  const authTokenResponse = await authToken(token as string);
  if (authTokenResponse) {
    await next();
  }
}
