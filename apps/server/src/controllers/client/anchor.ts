import type {
  ClearAnchorCheckRequest,
  GetAnchorListRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { clearAnchorCheck, getAnchorList } from '../../services';

export default class AnchorController {
  static async getAnchorList(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<GetAnchorListRequest>();
    ctx.body = await getAnchorList({ ...data, org_id: org_info.id });
    await next();
  }

  static async clearAnchorCheck(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<ClearAnchorCheckRequest>();
    ctx.body = await clearAnchorCheck({ ...data, org_id: org_info.id });
    await next();
  }
}
