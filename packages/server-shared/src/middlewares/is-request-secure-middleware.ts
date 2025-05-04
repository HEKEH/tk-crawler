import type { Context, Next } from 'koa';
import {
  NONCE_HEADER_KEY,
  SECURITY_HEADER_KEY,
  TIMESTAMP_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { redisClient, RedisNamespace } from '@tk-crawler/database';
import { isTimestampValid, verifyRequest } from '@tk-crawler/secure';

export const secureCheckRedisNamespace = new RedisNamespace(
  redisClient,
  'c-a-r-se', // secure check
);
export function isRequestSecureMiddleware() {
  return async (ctx: Context, next: Next) => {
    const { headers } = ctx.request;
    const {
      [SECURITY_HEADER_KEY]: security,
      [TIMESTAMP_HEADER_KEY]: timestamp,
      [NONCE_HEADER_KEY]: nonce,
    } = headers;
    ctx.logger.info('[isRequestSecureMiddleware] headers', {
      security,
      timestamp,
      nonce,
    });
    const setForbidden = () => {
      ctx.status = 403;
      ctx.body = {
        message: 'Forbidden',
      };
    };
    if (!security || !timestamp || !nonce) {
      setForbidden();
      return;
    }
    if (!isTimestampValid(Number(timestamp))) {
      setForbidden();
      return;
    }
    const isNonceExist = await secureCheckRedisNamespace.get(`nonce-${nonce}`);
    if (isNonceExist) {
      setForbidden();
      return;
    }
    const params = ctx.getRequestData<any>();
    const requestData = {
      path: ctx.request.url,
      method: ctx.request.method.toLowerCase() as 'get' | 'post',
      timestamp: Number(timestamp),
      nonce: nonce as string,
      params,
    };
    const isVerifySuccess = await verifyRequest(
      requestData,
      security as string,
    );
    if (!isVerifySuccess) {
      ctx.logger.error('[isRequestSecureMiddleware] secure check failed');
      setForbidden();
      return;
    }
    ctx.logger.info('[isRequestSecureMiddleware] secure check success');
    await secureCheckRedisNamespace.set(`nonce-${nonce}`, '1', 60 * 60);
    await next();
  };
}
