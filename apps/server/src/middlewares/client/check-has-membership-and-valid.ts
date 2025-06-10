import type { Context, Next } from 'koa';
import { OrganizationStatus } from '@tk-crawler/biz-shared';
import { BusinessError } from '../../utils';

export async function checkHasMembershipAndValid(ctx: Context, next: Next) {
  const { org_info } = ctx.clientInfo!;
  if (org_info.status !== OrganizationStatus.normal) {
    throw new BusinessError('您的机构已被禁用，请联系管理员');
  }
  if (!org_info.if_membership_valid) {
    if (org_info.membership_expire_at) {
      throw new BusinessError('您的机构会员已过期，请及时续费会员');
    }
    throw new BusinessError('您的机构不是会员，请先创建会员');
  }
  await next();
}
