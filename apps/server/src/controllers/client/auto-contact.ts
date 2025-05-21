import type {
  ClearAnchorCommentTemplateGroupRequest,
  ClearAnchorCommentTemplateRequest,
  CreateAnchorCommentTemplateGroupRequest,
  CreateAnchorCommentTemplateRequest,
  DeleteAnchorCommentTemplateGroupRequest,
  DeleteAnchorCommentTemplateRequest,
  GetAnchorCommentTemplateGroupByIdRequest,
  GetAnchorCommentTemplateGroupListRequest,
  GetAnchorCommentTemplateListRequest,
  UpdateAnchorCommentTemplateGroupRequest,
  UpdateAnchorCommentTemplateRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  clearAnchorCommentTemplate,
  clearAnchorCommentTemplateGroup,
  createAnchorCommentTemplate,
  createAnchorCommentTemplateGroup,
  deleteAnchorCommentTemplate,
  deleteAnchorCommentTemplateGroup,
  getAnchorCommentTemplateGroupById,
  getAnchorCommentTemplateGroupList,
  getAnchorCommentTemplateList,
  updateAnchorCommentTemplate,
  updateAnchorCommentTemplateGroup,
} from '../../services';

function wrapDataWithOrgId<T>(data: T, ctx: Context) {
  const { org_info } = ctx.clientInfo!;
  const org_id = org_info.id;
  return { ...data, org_id };
}

export default class AutoContactController {
  // 评论模板相关接口
  static async getAnchorCommentTemplateList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorCommentTemplateListRequest>();
    ctx.body = await getAnchorCommentTemplateList(wrapDataWithOrgId(data, ctx));
    await next();
  }

  static async createAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateAnchorCommentTemplateRequest>();

    ctx.body = await createAnchorCommentTemplate(wrapDataWithOrgId(data, ctx));
    await next();
  }

  static async updateAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorCommentTemplateRequest>();
    await updateAnchorCommentTemplate(wrapDataWithOrgId(data, ctx));
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorCommentTemplateRequest>();
    ctx.body = await deleteAnchorCommentTemplate(wrapDataWithOrgId(data, ctx));
    await next();
  }

  static async clearAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ClearAnchorCommentTemplateRequest>();
    ctx.body = await clearAnchorCommentTemplate(wrapDataWithOrgId(data, ctx));
    await next();
  }

  // 评论模板分组相关接口
  static async getAnchorCommentTemplateGroupList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorCommentTemplateGroupListRequest>();
    ctx.body = await getAnchorCommentTemplateGroupList(
      wrapDataWithOrgId(data, ctx),
    );
    await next();
  }

  static async getAnchorCommentTemplateGroupById(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorCommentTemplateGroupByIdRequest>();
    ctx.body = await getAnchorCommentTemplateGroupById(
      wrapDataWithOrgId(data, ctx),
    );
    await next();
  }

  static async createAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateAnchorCommentTemplateGroupRequest>();
    ctx.body = await createAnchorCommentTemplateGroup(
      wrapDataWithOrgId(data, ctx),
    );
    await next();
  }

  static async updateAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorCommentTemplateGroupRequest>();
    await updateAnchorCommentTemplateGroup(wrapDataWithOrgId(data, ctx));
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorCommentTemplateGroupRequest>();
    ctx.body = await deleteAnchorCommentTemplateGroup(
      wrapDataWithOrgId(data, ctx),
    );
    await next();
  }

  static async clearAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ClearAnchorCommentTemplateGroupRequest>();
    ctx.body = await clearAnchorCommentTemplateGroup(
      wrapDataWithOrgId(data, ctx),
    );
    await next();
  }
}
