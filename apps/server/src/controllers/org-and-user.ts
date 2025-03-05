import type {
  CreateOrgRequest,
  DeleteOrgRequest,
  GetOrgListRequest,
  UpdateOrgRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { createOrg, deleteOrg, getOrgList, updateOrg } from '../services';

export default class OrgAndUserController {
  static async getOrgList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetOrgListRequest>();
    ctx.body = await getOrgList(data);
    await next();
  }

  static async deleteOrg(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteOrgRequest>();
    await deleteOrg(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async createOrg(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateOrgRequest>();
    await createOrg(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrg(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgRequest>();
    await updateOrg(data);
    ctx.body = ctx.t('Success');
    await next();
  }
}
