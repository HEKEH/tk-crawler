import type {
  LoginByTokenRequest,
  MobileAnchorContactedRequest,
  MobileGetAssignedAnchorListRequest,
  MobileOrgMemberLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import assert from 'node:assert';
import {
  mobileAnchorContacted,
  mobileGetAssignedAnchorList,
  mobileOrgMemberLogin,
} from '../../services';
import { BusinessError } from '../../utils';

export default class MobileController {
  static async mobileOrgMemberLogin(ctx: Context, next: Next) {
    const data = ctx.getRequestData<MobileOrgMemberLoginRequest>();
    ctx.body = await mobileOrgMemberLogin(data);
    await next();
  }

  static async mobileOrgMemberLoginByToken(ctx: Context, next: Next) {
    const data = ctx.getRequestData<LoginByTokenRequest>();
    const { org_info, user_info, device_id: token_device_id } = ctx.clientInfo!;
    assert(data.device_id, '设备ID不能为空');
    if (data.device_id !== token_device_id) {
      throw new BusinessError('设备不匹配');
    }
    ctx.body = {
      org_info,
      user_info,
    };
    await next();
  }

  static async getAssignedAnchorList(ctx: Context, next: Next) {
    const { org_info, user_info, device_id: token_device_id } = ctx.clientInfo!;
    const data = ctx.getRequestData<MobileGetAssignedAnchorListRequest>();
    ctx.body = await mobileGetAssignedAnchorList({
      ...data,
      org_id: org_info.id,
      org_member_id: user_info.id,
      token_device_id,
    });
    await next();
  }

  static async anchorContacted(ctx: Context, next: Next) {
    const { org_info, user_info, device_id: token_device_id } = ctx.clientInfo!;
    const data = ctx.getRequestData<MobileAnchorContactedRequest>();
    await mobileAnchorContacted({
      ...data,
      org_id: org_info.id,
      org_member_id: user_info.id,
      token_device_id,
    });
    ctx.body = ctx.t('Success');
    await next();
  }
}
