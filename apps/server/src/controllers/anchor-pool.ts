import type {
  DeleteAnchorCrawlRecordRequest,
  RecordAnchorCrawlRequest,
  ShouldUpdateAnchorRequest,
  UpdateAnchorRequest,
} from '@tk-crawler/shared';
import type { Context, Next } from 'koa';
import {
  deleteAnchorCrawlRecord,
  recordAnchorCrawl,
  shouldUpdateAnchor,
  updateAnchor,
} from '../services';

export default class AnchorPoolController {
  static async shouldUpdateAnchor(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ShouldUpdateAnchorRequest>();
    ctx.body = await shouldUpdateAnchor(data);
    await next();
  }

  static async recordAnchorCrawl(ctx: Context, next: Next) {
    const data = ctx.getRequestData<RecordAnchorCrawlRequest>();
    await recordAnchorCrawl(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCrawlRecord(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorCrawlRecordRequest>();
    await deleteAnchorCrawlRecord(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async updateAnchor(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorRequest>();
    await updateAnchor(data);
    ctx.body = ctx.t('Success');
    await next();
  }
}
