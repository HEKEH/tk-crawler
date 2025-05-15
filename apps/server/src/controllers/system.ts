import type {
  GetAllTKGuildUserListRequest,
  StartTKLiveAdminAccountRequest,
  StopTKLiveAdminAccountRequest,
  SystemAdminUser,
  SystemCrawlStatisticsRequest,
  SystemUserChangePasswordRequest,
  SystemUserLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  changeSystemUserPassword,
  getAllTKGuildUserList,
  getCrawlStatistics,
  startLiveAdminAccount,
  stopLiveAdminAccount,
  systemUserLogin,
} from '../services';

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

  static async getCrawlStatistics(ctx: Context, next: Next) {
    const request = ctx.getRequestData<SystemCrawlStatisticsRequest>();
    const resp = await getCrawlStatistics(request);
    ctx.body = resp;
    await next();
  }

  static async getAllTKGuildUserList(ctx: Context, next: Next) {
    const request = ctx.getRequestData<GetAllTKGuildUserListRequest>();
    const resp = await getAllTKGuildUserList(request, ctx.logger);
    ctx.body = resp;
    await next();
  }

  static async startTKGuildUserAccount(ctx: Context, next: Next) {
    const request = ctx.getRequestData<StartTKLiveAdminAccountRequest>();
    const resp = await startLiveAdminAccount(request);
    ctx.body = resp;
    await next();
  }

  static async stopTKGuildUserAccount(ctx: Context, next: Next) {
    const request = ctx.getRequestData<StopTKLiveAdminAccountRequest>();
    const resp = await stopLiveAdminAccount(request);
    ctx.body = resp;
    await next();
  }
}
