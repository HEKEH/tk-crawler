import type { OrgMemberLoginRequest } from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { logger } from '../infra/logger';
import { orgMemberLogin } from '../services';

export default class AuthController {
  static async orgMemberLogin(ctx: Context, next: Next) {
    const data = ctx.getRequestData<OrgMemberLoginRequest>();
    ctx.body = await orgMemberLogin(data);
    await next();
  }

  static async orgMemberLoginByToken(ctx: Context, next: Next) {
    logger.info('[Org Member Login By Token]');
    ctx.body = ctx.clientInfo!;
    await next();
  }
}
