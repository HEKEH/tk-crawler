import type {
  CreateOrgMemberRequest,
  CreateOrgRequest,
  DeleteOrgMemberRequest,
  DeleteOrgRequest,
  GetOrgListRequest,
  GetOrgMemberListRequest,
  UpdateOrgMemberRequest,
  UpdateOrgMembershipRequest,
  UpdateOrgRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  createOrg,
  createOrgMember,
  deleteOrg,
  deleteOrgMember,
  getOrgList,
  getOrgMemberList,
  updateOrg,
  updateOrgMember,
  updateOrgMembership,
} from '../services';

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

  static async updateOrgMembership(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgMembershipRequest>();
    await updateOrgMembership(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async getOrgMemberList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetOrgMemberListRequest>();
    ctx.body = await getOrgMemberList(data);
    await next();
  }

  static async createOrgMember(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateOrgMemberRequest>();
    await createOrgMember(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrgMember(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgMemberRequest>();
    await updateOrgMember(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteOrgMember(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteOrgMemberRequest>();
    await deleteOrgMember(data);
    ctx.body = ctx.t('Success');
    await next();
  }
}
