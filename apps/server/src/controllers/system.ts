import type {
  SystemAdminUser,
  SystemUserChangePasswordRequest,
  SystemUserLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { logger } from '../infra/logger';
import { changeSystemUserPassword, systemUserLogin } from '../services';

export default class SystemController {
  static async login(ctx: Context, next: Next) {
    const data = ctx.getRequestData<SystemUserLoginRequest>();
    ctx.body = await systemUserLogin(data);
    logger.info(`[logId: ${ctx.logId}][System User Login]`);
    await next();
  }

  static async loginByToken(ctx: Context, next: Next) {
    ctx.body = ctx.systemUserInfo!;
    logger.info(`[System User Login By Token] ${ctx.logId}`);
    await next();
  }

  static async changePassword(ctx: Context, next: Next) {
    const data = ctx.getRequestData<SystemUserChangePasswordRequest>();
    await changeSystemUserPassword(
      data,
      ctx.systemUserInfo! as {
        user_info: Required<SystemAdminUser['user_info']>;
      },
    );
    ctx.body = ctx.t('Success');
    await next();
  }
}
