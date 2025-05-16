import type {
  CreateTKGuildUserRequest,
  DeleteTKGuildUserRequest,
  GetTKGuildUserDetailRequest,
  GetTKGuildUserListRequest,
  IsAnyGuildAccountErrorRequest,
  StartTKLiveAdminAccountRequest,
  StopTKLiveAdminAccountRequest,
  UpdateTKGuildUserRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  createTKGuildUser,
  deleteTKGuildUser,
  getTKGuildUserDetail,
  getTKGuildUserList,
  isAnyGuildAccountError,
  startLiveAdminAccount,
  stopLiveAdminAccount,
  updateTKGuildUser,
} from '../../services/tk-guild-user';

export default class TKGuildUserController {
  static async getTKGuildUserList(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<GetTKGuildUserListRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    ctx.logger.info('[Get TK Guild User List] Request', {
      requestWithOrgId,
    });
    const resp = await getTKGuildUserList(requestWithOrgId);
    ctx.logger.info('[Get TK Guild User List] Response', {
      length: resp.list.length,
      total: resp.total,
    });
    ctx.logger.trace('[Get TK Guild User List] Response Detailed', resp);
    ctx.body = resp;
    await next();
  }

  static async getTKGuildUserDetail(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<GetTKGuildUserDetailRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    ctx.body = await getTKGuildUserDetail(requestWithOrgId);
    await next();
  }

  static async createTKGuildUser(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<CreateTKGuildUserRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    ctx.body = await createTKGuildUser(requestWithOrgId);
    await next();
  }

  static async updateTKGuildUser(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<UpdateTKGuildUserRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    await updateTKGuildUser(requestWithOrgId);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteTKGuildUser(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<DeleteTKGuildUserRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    ctx.body = await deleteTKGuildUser(requestWithOrgId);
    await next();
  }

  // static async updateTKGuildUserCookie(ctx: Context, next: Next) {
  //   const { org_info } = ctx.clientInfo!;
  //   const data = ctx.getRequestData<UpdateTKGuildUserCookieRequest>();
  //   // Add org_id from context to the request data
  //   const requestWithOrgId = {
  //     ...data,
  //     org_id: org_info.id,
  //   };
  //   await updateTKGuildUserCookie(requestWithOrgId);
  //   ctx.body = ctx.t('Success');
  //   await next();
  // }

  static async startLiveAdminAccount(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<StartTKLiveAdminAccountRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    await startLiveAdminAccount(requestWithOrgId);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async stopLiveAdminAccount(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<StopTKLiveAdminAccountRequest>();
    // Add org_id from context to the request data
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    await stopLiveAdminAccount(requestWithOrgId);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async isAnyAccountError(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<IsAnyGuildAccountErrorRequest>();
    const requestWithOrgId = {
      ...data,
      org_id: org_info.id,
    };
    ctx.body = await isAnyGuildAccountError(requestWithOrgId, ctx.logger);
    await next();
  }
}
