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
    const result = await getAnchorList({ ...data, org_id: org_info.id });
    ctx.logger.info('[Get Anchor List] success', ctx.clientInfo, {
      length: result.list?.length,
    });
    ctx.body = result;
    await next();
  }

  static async clearAnchorCheck(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<ClearAnchorCheckRequest>();
    const result = await clearAnchorCheck({ ...data, org_id: org_info.id });
    ctx.logger.info('[Clear Anchor Check] success', ctx.clientInfo, {
      deleted_count: result.deleted_count,
    });
    ctx.body = result;
    await next();
  }
}
