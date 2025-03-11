import type {
  OrgMemberLoginByTokenRequest,
  OrgMemberLoginRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { orgMemberLogin, orgMemberLoginByToken } from '../services';

export default class AuthController {
  static async orgMemberLogin(ctx: Context, next: Next) {
    const data = ctx.getRequestData<OrgMemberLoginRequest>();
    ctx.body = await orgMemberLogin(data);
    await next();
  }

  static async orgMemberLoginByToken(ctx: Context, next: Next) {
    const data = ctx.getRequestData<OrgMemberLoginByTokenRequest>();
    ctx.body = await orgMemberLoginByToken(data);
    await next();
  }
}
