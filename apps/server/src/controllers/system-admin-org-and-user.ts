import type {
  CreateOrgMemberRequest,
  CreateOrgRequest,
  DeleteOrgMemberRequest,
  DeleteOrgRequest,
  GetOrgListRequest,
  GetOrgMemberListRequest,
  SystemAdminUserInfo,
  UpdateOrgAutoFollowDeviceLimitRequest,
  UpdateOrgMemberRequest,
  UpdateOrgMembershipRequest,
  UpdateOrgRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { AdminFeature } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import {
  createOrg,
  createOrgMember,
  deleteOrg,
  deleteOrgMember,
  getOrgList,
  getOrgMemberList,
  updateAutoFollowDeviceLimit,
  updateOrg,
  updateOrgMember,
  updateOrgMembership,
} from '../services';
import { BusinessError } from '../utils';

async function checkOrgOwner(
  orgId: string,
  userInfo: Pick<SystemAdminUserInfo, 'id' | 'features'>,
): Promise<void> {
  if (userInfo.features.includes(AdminFeature.ONLY_OWN_ORG)) {
    const org = await mysqlClient.prismaClient.organization.findUnique({
      where: {
        id: BigInt(orgId),
      },
    });
    if (!org) {
      throw new BusinessError('机构不存在');
    }
    if (org.owner_id !== BigInt(userInfo.id)) {
      throw new BusinessError('您没有权限操作该机构');
    }
  }
}

export default class SystemAdminOrgAndUserController {
  static async getOrgList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetOrgListRequest>();
    const adminUserInfo = ctx.systemUserInfo!.user_info;
    ctx.body = await getOrgList(
      data,
      adminUserInfo,
      {
        include_owner_info: true,
      },
      ctx.logger,
    );
    await next();
  }

  static async deleteOrg(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteOrgRequest>();
    const adminUserInfo = ctx.systemUserInfo!.user_info;
    await deleteOrg(data, adminUserInfo, ctx.logger);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async createOrg(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateOrgRequest>();
    const adminUserInfo = ctx.systemUserInfo!.user_info;
    await createOrg(data, adminUserInfo, ctx.logger);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrg(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgRequest>();
    const adminUserInfo = ctx.systemUserInfo!.user_info;
    await updateOrg(data, adminUserInfo, ctx.logger);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrgMembership(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgMembershipRequest>();
    const adminUserInfo = ctx.systemUserInfo!.user_info;
    await updateOrgMembership(data, adminUserInfo, ctx.logger);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrgAutoFollowDeviceLimit(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgAutoFollowDeviceLimitRequest>();
    const adminUserInfo = ctx.systemUserInfo!.user_info;
    await updateAutoFollowDeviceLimit(data, adminUserInfo, ctx.logger);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async getOrgMemberList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetOrgMemberListRequest>();
    await checkOrgOwner(data.org_id, ctx.systemUserInfo!.user_info);
    ctx.body = await getOrgMemberList(data);
    await next();
  }

  static async createOrgMember(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateOrgMemberRequest>();
    await checkOrgOwner(data.org_id, ctx.systemUserInfo!.user_info);
    await createOrgMember(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateOrgMember(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateOrgMemberRequest>();
    await checkOrgOwner(data.org_id, ctx.systemUserInfo!.user_info);
    await updateOrgMember(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteOrgMember(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteOrgMemberRequest>();
    await checkOrgOwner(data.org_id, ctx.systemUserInfo!.user_info);
    await deleteOrgMember(data);
    ctx.body = ctx.t('Success');
    await next();
  }
}
