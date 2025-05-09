import type {
  CreateOrgMemberRequest,
  DeleteOrgMemberRequest,
  GetOrgMemberListRequest,
  UpdateOrgAnchorSearchPoliciesRequest,
  UpdateOrgMemberRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  createOrgMember,
  deleteOrgMember,
  getOrgMemberList,
  updateOrgAnchorSearchPolicies,
  updateOrgMember,
} from '../../services';

export default class ClientOrgAndUserController {
  static async getOrgMemberList(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<Omit<GetOrgMemberListRequest, 'org_id'>>();
    ctx.body = await getOrgMemberList({ ...data, org_id: org_info.id });
    await next();
  }

  static async createOrgMember(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<Omit<CreateOrgMemberRequest, 'org_id'>>();
    await createOrgMember({ ...data, org_id: org_info.id });
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrgMember(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<UpdateOrgMemberRequest['data']>();
    await updateOrgMember({ data, org_id: org_info.id });
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteOrgMember(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<Omit<DeleteOrgMemberRequest, 'org_id'>>();
    await deleteOrgMember({ ...data, org_id: org_info.id });
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrgAnchorSearchPolicies(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<UpdateOrgAnchorSearchPoliciesRequest>();
    await updateOrgAnchorSearchPolicies({ ...data, org_id: org_info.id });
    ctx.body = ctx.t('Success');
    await next();
  }
}
