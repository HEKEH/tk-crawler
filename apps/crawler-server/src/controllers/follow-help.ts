import type {
  ClearAnchorCommentTemplateGroupRequest,
  ClearAnchorCommentTemplateRequest,
  ClearAnchorFollowGroupRequest,
  ClearAnchorFrom87Request,
  CreateAnchorCommentTemplateGroupRequest,
  CreateAnchorCommentTemplateRequest,
  CreateAnchorFollowGroupRequest,
  CreateOrUpdateAnchorFrom87Request,
  DeleteAnchorCommentTemplateGroupRequest,
  DeleteAnchorCommentTemplateRequest,
  DeleteAnchorFollowGroupRequest,
  DeleteAnchorFrom87Request,
  GetAnchorCommentTemplateGroupByIdRequest,
  GetAnchorCommentTemplateGroupListRequest,
  GetAnchorCommentTemplateListRequest,
  GetAnchorFollowGroupListRequest,
  GetAnchorFollowGroupRequest,
  GetAnchorFollowGroupWithAnchorIdsRequest,
  GetAnchorFrom87ListRequest,
  UpdateAnchorCommentTemplateGroupRequest,
  UpdateAnchorCommentTemplateRequest,
  UpdateAnchorFollowGroupRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  clearAnchorCommentTemplate,
  clearAnchorCommentTemplateGroup,
  clearAnchorFollowGroup,
  clearAnchorFrom87,
  createAnchorCommentTemplate,
  createAnchorCommentTemplateGroup,
  createAnchorFollowGroup,
  createOrUpdateAnchorFrom87,
  deleteAnchorCommentTemplate,
  deleteAnchorCommentTemplateGroup,
  deleteAnchorFollowGroup,
  deleteAnchorFrom87,
  getAnchorCommentTemplateGroupById,
  getAnchorCommentTemplateGroupList,
  getAnchorCommentTemplateList,
  getAnchorFollowGroup,
  getAnchorFollowGroupList,
  getAnchorFollowGroupWithAnchorIds,
  getAnchorFrom87List,
  updateAnchorCommentTemplate,
  updateAnchorCommentTemplateGroup,
  updateAnchorFollowGroup,
} from '../services';

export default class FollowHelpController {
  // 主播相关接口
  static async getAnchorFrom87List(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorFrom87ListRequest>();
    ctx.body = await getAnchorFrom87List(data);
    await next();
  }

  static async createOrUpdateAnchorFrom87(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateOrUpdateAnchorFrom87Request>();
    ctx.body = await createOrUpdateAnchorFrom87(data);
    await next();
  }

  static async deleteAnchorFrom87(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorFrom87Request>();
    ctx.body = await deleteAnchorFrom87(data);
    await next();
  }

  static async clearAnchorFrom87(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ClearAnchorFrom87Request>();
    ctx.body = await clearAnchorFrom87(data);
    await next();
  }

  // 分组相关接口
  static async getAnchorFollowGroupList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorFollowGroupListRequest>();
    ctx.body = await getAnchorFollowGroupList(data);
    await next();
  }

  static async getAnchorFollowGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorFollowGroupRequest>();
    ctx.body = await getAnchorFollowGroup(data);
    await next();
  }

  static async getAnchorFollowGroupWithAnchorIds(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorFollowGroupWithAnchorIdsRequest>();
    ctx.body = await getAnchorFollowGroupWithAnchorIds(data);
    await next();
  }

  static async createAnchorFollowGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateAnchorFollowGroupRequest>();
    ctx.body = await createAnchorFollowGroup(data);
    await next();
  }

  static async updateAnchorFollowGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorFollowGroupRequest>();
    await updateAnchorFollowGroup(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorFollowGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorFollowGroupRequest>();
    ctx.body = await deleteAnchorFollowGroup(data);
    await next();
  }

  static async clearAnchorFollowGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ClearAnchorFollowGroupRequest>();
    ctx.body = await clearAnchorFollowGroup(data);
    await next();
  }

  // 评论模板相关接口
  static async getAnchorCommentTemplateList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorCommentTemplateListRequest>();
    ctx.body = await getAnchorCommentTemplateList(data);
    await next();
  }

  static async createAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateAnchorCommentTemplateRequest>();
    ctx.body = await createAnchorCommentTemplate(data);
    await next();
  }

  static async updateAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorCommentTemplateRequest>();
    await updateAnchorCommentTemplate(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorCommentTemplateRequest>();
    ctx.body = await deleteAnchorCommentTemplate(data);
    await next();
  }

  static async clearAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ClearAnchorCommentTemplateRequest>();
    ctx.body = await clearAnchorCommentTemplate(data);
    await next();
  }

  // 评论模板分组相关接口
  static async getAnchorCommentTemplateGroupList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorCommentTemplateGroupListRequest>();
    ctx.body = await getAnchorCommentTemplateGroupList(data);
    await next();
  }

  static async getAnchorCommentTemplateGroupById(ctx: Context, next: Next) {
    const data = ctx.getRequestData<GetAnchorCommentTemplateGroupByIdRequest>();
    ctx.body = await getAnchorCommentTemplateGroupById(data);
    await next();
  }

  static async createAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateAnchorCommentTemplateGroupRequest>();
    ctx.body = await createAnchorCommentTemplateGroup(data);
    await next();
  }

  static async updateAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<UpdateAnchorCommentTemplateGroupRequest>();
    await updateAnchorCommentTemplateGroup(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<DeleteAnchorCommentTemplateGroupRequest>();
    ctx.body = await deleteAnchorCommentTemplateGroup(data);
    await next();
  }

  static async clearAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<ClearAnchorCommentTemplateGroupRequest>();
    ctx.body = await clearAnchorCommentTemplateGroup(data);
    await next();
  }
}
