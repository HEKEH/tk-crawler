import type { Context, Next } from 'koa';
import { AssertionError } from 'node:assert';
import { LOG_ID_HEADER_KEY } from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { BusinessError, TokenInvalidError } from '../utils';

interface ExcludeLogUrl {
  path: string;
  exact?: boolean;
}
const EXCLUDE_LOG_URLS: ExcludeLogUrl[] = [
  {
    path: '/anchor-pool/should-update-anchor',
    exact: true,
  },
];

export async function requestWrapMiddleware(ctx: Context, next: Next) {
  try {
    const shouldLog = !EXCLUDE_LOG_URLS.some(it => {
      if (it.exact) {
        return it.path === ctx.request.url;
      }
      return ctx.request.url.includes(it.path);
    });
    if (shouldLog) {
      const logData: any = {
        method: ctx.request.method,
        url: ctx.request.url,
        headers: ctx.request.headers,
      };
      if (ctx.request.method === 'POST') {
        logData.body = ctx.request.body;
      }
      ctx.logger.info(`[Request]`, logData);
    }
    await next();
    if (ctx.status === 200) {
      const body = ctx.body;
      let responseBody: any;
      if ((body as any).$is_whole_response) {
        const { $is_whole_response, ...rest } = body as any;
        responseBody = rest;
      } else {
        responseBody = {
          status_code: RESPONSE_CODE.SUCCESS,
          data: body,
        };
      }
      if (shouldLog) {
        ctx.logger.info(`[Response] success`);
        ctx.logger.trace(`[Response]`, responseBody);
      }
      ctx.body = responseBody;
    } else {
      ctx.logger.error(`[Response]`, ctx.body);
    }
  } catch (error) {
    if (error instanceof TokenInvalidError) {
      ctx.status = 200;
      ctx.body = {
        status_code: RESPONSE_CODE.TOKEN_INVALID,
        message: ctx.t(error.message),
      };
      ctx.logger.error(`[Token Invalid Error]`, error);
      return;
    }
    if (error instanceof AssertionError || error instanceof BusinessError) {
      ctx.status = 200;
      ctx.body = {
        status_code: RESPONSE_CODE.BIZ_ERROR,
        message: ctx.t(error.message),
      };
      ctx.logger.error(`[Business Error]`, error);
      return;
    }
    ctx.status = 500;
    ctx.body = {
      status_code: RESPONSE_CODE.SERVER_ERROR,
      message: ctx.t('An unexpected error occurred'),
    };
    // Log the actual error for debugging purposes
    ctx.logger.error(`[Internal Error]`, error);
  } finally {
    // add logId to response header
    ctx.set(LOG_ID_HEADER_KEY, ctx.logId);
  }
}
