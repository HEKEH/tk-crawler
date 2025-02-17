import type {
  ShouldUpdateAnchorRequest,
  UpdateAnchorRequest,
} from '@tk-crawler/shared';
import type { Context, Next } from 'koa';
import { shouldUpdateAnchor, updateAnchor } from '../services';

export default class AnchorPoolController {
  static async shouldUpdateAnchor(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ShouldUpdateAnchorRequest>();
    ctx.body = await shouldUpdateAnchor(data);
    await next();
  }

  static async updateAnchor(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorRequest>();
    await updateAnchor(data);
    ctx.body = ctx.t('Success');
    await next();
  }
}
