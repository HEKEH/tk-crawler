import type {
  ClearAnchorCheckRequest,
  GetAnchorListForDownloadRequest,
  GetAnchorListRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  clearAnchorCheck,
  getAnchorList,
  getAnchorListForDownload,
} from '../../services';

export default class AnchorController {
  static async getAnchorList(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<GetAnchorListRequest>();
    ctx.logger.info('[Get Anchor List] request', ctx.clientInfo, data);
    const result = await getAnchorList(
      { ...data, org_id: org_info.id },
      ctx.logger,
    );
    ctx.logger.info('[Get Anchor List] success', ctx.clientInfo, {
      length: result.list?.length,
    });
    ctx.body = result;
    await next();
  }

  static async getAnchorListForDownload(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<GetAnchorListForDownloadRequest>();
    ctx.logger.info(
      '[Get Anchor List For Download] request',
      ctx.clientInfo,
      data,
    );
    const result = await getAnchorListForDownload({
      ...data,
      org_id: org_info.id,
    });
    ctx.logger.info('[Get Anchor List For Download] success', ctx.clientInfo, {
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
