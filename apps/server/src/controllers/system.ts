import type {
  CreateSystemAdminUserRequest,
  DeleteSystemAdminUserRequest,
  GetAllTKGuildUserListRequest,
  GetSystemAdminUserListRequest,
  IsAnyGuildAccountErrorRequest,
  StartTKLiveAdminAccountRequest,
  StopTKLiveAdminAccountRequest,
  SystemAdminUser,
  SystemCrawlStatisticsRequest,
  SystemUserChangePasswordRequest,
  SystemUserLoginRequest,
  UpdateSystemAdminUserRequest,
} from '@tk-crawler/biz-shared';
import type { Prisma } from '@tk-crawler/database';
import type { Context, Next } from 'koa';
import { OrganizationStatus } from '@tk-crawler/biz-shared';

import {
  changeSystemUserPassword,
  createSystemAdminUser,
  deleteSystemAdminUser,
  getAllTKGuildUserList,
  getCrawlStatistics,
  getSystemAdminUserList,
  isAnyGuildAccountError,
  startLiveAdminAccount,
  stopLiveAdminAccount,
  systemAdminUserLogin,
  updateSystemAdminUser,
} from '../services';

export default class SystemController {
  static async login(ctx: Context, next: Next) {
    const data = ctx.getRequestData<SystemUserLoginRequest>();
    const resp = await systemAdminUserLogin(data);
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
    let request = ctx.getRequestData<GetAllTKGuildUserListRequest>();
    const organizationFilter: Prisma.OrganizationWhereInput = {
      ...request.filter?.organization,
      status: OrganizationStatus.normal,
      membership_expire_at: {
        gt: new Date(),
      },
    };
    request = {
      ...request,
      filter: {
        ...request.filter,
        organization: organizationFilter,
      },
    };
    const resp = await getAllTKGuildUserList(request, ctx.logger);
    ctx.body = resp;
    await next();
  }

  static async startTKGuildUserAccount(ctx: Context, next: Next) {
    const request = ctx.getRequestData<StartTKLiveAdminAccountRequest>();
    await startLiveAdminAccount({
      ...request,
      started_by: '后台人员',
    });
    ctx.body = ctx.t('Success');
    await next();
  }

  static async stopTKGuildUserAccount(ctx: Context, next: Next) {
    const request = ctx.getRequestData<StopTKLiveAdminAccountRequest>();
    await stopLiveAdminAccount(request);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async isAnyGuildAccountError(ctx: Context, next: Next) {
    let request = ctx.getRequestData<IsAnyGuildAccountErrorRequest>();
    const organizationFilter: Prisma.OrganizationWhereInput = {
      ...request.filter?.organization,
      status: OrganizationStatus.normal,
      membership_expire_at: {
        gt: new Date(),
      },
    };
    request = {
      ...request,
      filter: {
        ...request.filter,
        organization: organizationFilter,
      },
    };
    const resp = await isAnyGuildAccountError(request, ctx.logger);
    ctx.body = resp;
    await next();
  }

  static async createSystemAdminUser(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateSystemAdminUserRequest>();
    await createSystemAdminUser(data, ctx.logger);
    ctx.logger.info('[Create System Admin User success]');
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateSystemAdminUser(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateSystemAdminUserRequest>();
    await updateSystemAdminUser(data, ctx.logger);
    ctx.logger.info('[Update System Admin User success]');
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteSystemAdminUser(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteSystemAdminUserRequest>();
    await deleteSystemAdminUser(data, ctx.logger);
    ctx.logger.info('[Delete System Admin User success]');
    ctx.body = ctx.t('Success');
    await next();
  }

  static async getSystemAdminUserList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetSystemAdminUserListRequest>();
    const resp = await getSystemAdminUserList(data, ctx.logger);
    ctx.body = resp;
    await next();
  }
}
