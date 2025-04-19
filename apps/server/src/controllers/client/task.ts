import type {
  AssignTaskRequest,
  CancelClaimTaskRequest,
  ClaimTaskRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import { assignTask, checkTasksCancelable } from '../../services';

export default class TaskController {
  static async assignTask(ctx: Context, next: Next) {
    const { org_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<AssignTaskRequest>();
    await assignTask({ ...data, org_id: org_info.id });
    ctx.body = ctx.t('Success');
    await next();
  }

  static async claimTask(ctx: Context, next: Next) {
    const { org_info, user_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<ClaimTaskRequest>();
    await assignTask(
      {
        ...data,
        org_id: org_info.id,
        org_member_id: user_info.id,
      },
      false,
    );
    ctx.body = ctx.t('Success');
    await next();
  }

  static async cancelClaimTask(ctx: Context, next: Next) {
    const { org_info, user_info } = ctx.clientInfo!;
    const data = ctx.getRequestData<CancelClaimTaskRequest>();
    await checkTasksCancelable({
      anchor_check_ids: data.anchor_check_ids,
      org_member_id: user_info.id,
    });
    await assignTask(
      {
        ...data,
        org_id: org_info.id,
        org_member_id: null,
      },
      false,
    );
    ctx.body = ctx.t('Success');
    await next();
  }
}
