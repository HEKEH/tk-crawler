import type {
  SystemAdminUser,
  SystemUserChangePasswordRequest,
  SystemUserLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { changeSystemUserPassword, systemUserLogin } from '../services';

export default class SystemController {
  static async login(ctx: Context, next: Next) {
    const data = ctx.getRequestData<SystemUserLoginRequest>();
    const resp = await systemUserLogin(data);
    ctx.logger.info(`[System User Login]`, resp);
    ctx.body = resp;
    await next();
  }

  static async loginByToken(ctx: Context, next: Next) {
    const resp = ctx.systemUserInfo!;
    ctx.logger.info(`[System User Login By Token]`, resp);
    ctx.body = resp;
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
