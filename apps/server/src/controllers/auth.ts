import type {
  OrgMemberChangePasswordRequest,
  OrgMemberItem,
  OrgMemberLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { changeOrgUserPassword, orgMemberLogin } from '../services';

export default class AuthController {
  static async orgMemberLogin(ctx: Context, next: Next) {
    const data = ctx.getRequestData<OrgMemberLoginRequest>();
    const resp = await orgMemberLogin(data);
    ctx.logger.info('[Org Member Login]', resp);
    ctx.body = resp;
    await next();
  }

  static async orgMemberLoginByToken(ctx: Context, next: Next) {
    const clientInfo = ctx.clientInfo!;
    ctx.logger.info('[Org Member Login By Token]', clientInfo);
    ctx.body = {
      user_info: clientInfo.user_info,
      org_info: clientInfo.org_info,
    };
    await next();
  }

  static async changePassword(ctx: Context, next: Next) {
    const data = ctx.getRequestData<OrgMemberChangePasswordRequest>();
    ctx.logger.info('[Change Password]', data, ctx.clientInfo);
    await changeOrgUserPassword(
      data,
      ctx.clientInfo!.user_info as OrgMemberItem,
    );
    ctx.body = ctx.t('Success');
    await next();
  }
}
