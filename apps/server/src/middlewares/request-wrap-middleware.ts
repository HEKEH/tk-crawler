import type { Context, Next } from 'koa';
import { AssertionError } from 'node:assert';
import { LOG_ID_HEADER_KEY, RESPONSE_CODE } from '@tk-crawler/shared';
import { logger } from '../infra/logger';
import { BusinessError } from '../utils';

export async function requestWrapMiddleware(ctx: Context, next: Next) {
  try {
    logger.info(`[logId: ${ctx.logId}] [Request]`, ctx.request);
    await next();
    if (ctx.status === 200) {
      const body = ctx.body;
      ctx.body = {
        status: RESPONSE_CODE.SUCCESS,
        data: body,
      };
    }
    logger.info(`[logId: ${ctx.logId}] [Response]`, ctx.body);
  } catch (error) {
    if (error instanceof AssertionError || error instanceof BusinessError) {
      ctx.status = 200;
      ctx.body = {
        status: RESPONSE_CODE.BIZ_ERROR,
        message: ctx.t(error.message),
      };
      logger.error(`[logId: ${ctx.logId}] [Business Error]`, error);
      return;
    }
    ctx.status = 500;
    ctx.body = {
      status: RESPONSE_CODE.SERVER_ERROR,
      message: ctx.t('An unexpected error occurred'),
    };
    // Log the actual error for debugging purposes
    logger.error(`[logId: ${ctx.logId}] [Internal Error]`, error);
  } finally {
    // add logId to response header
    ctx.set(LOG_ID_HEADER_KEY, ctx.logId);
  }
}
