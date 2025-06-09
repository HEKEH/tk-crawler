import type {
  GetMobileDeviceListRequest,
  LoginByTokenRequest,
  MobileAnchorContactedRequest,
  MobileGetAssignedAnchorListRequest,
  MobileOrgMemberLoginByTokenResponse,
  MobileOrgMemberLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import assert from 'node:assert';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import {
  getAutoFollowMobileDeviceList,
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
    const responseBody: MobileOrgMemberLoginByTokenResponse & {
      $is_whole_response: true;
    } = {
      $is_whole_response: true,
      status_code: RESPONSE_CODE.SUCCESS,
      data: {
        org_info,
        user_info,
      },
      token_expires_at: ctx.clientInfo!.token_expires_at,
    };
    ctx.body = responseBody;
    await next();
  }

  static async getAssignedAnchorList(ctx: Context, next: Next) {
    const { org_info, user_info, device_id: token_device_id } = ctx.clientInfo!;
    const data = ctx.getRequestData<MobileGetAssignedAnchorListRequest>();
    ctx.body = await mobileGetAssignedAnchorList(
      {
        ...data,
        org_id: org_info.id,
        org_member_id: user_info.id,
        token_device_id,
      },
      ctx.logger,
    );
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

  static async getMobileDeviceList(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<GetMobileDeviceListRequest>();
    ctx.body = await getAutoFollowMobileDeviceList(
      {
        ...data,
        org_id: org_info.id,
      },
      ctx.logger,
    );
    await next();
  }
}
