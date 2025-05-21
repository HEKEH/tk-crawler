import type {
  BatchAddToAnchorFollowGroupRequest,
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
  batchAddToAnchorFollowGroup,
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
    ctx.logger.info('[Get Anchor From 87 List]', { data });
    ctx.body = await getAnchorFrom87List(data);
    await next();
  }

  static async createOrUpdateAnchorFrom87(ctx: Context, next: Next) {
    const data = ctx.getRequestData<CreateOrUpdateAnchorFrom87Request>();
    ctx.logger.info('[Create Or Update Anchor From 87]', {
      dataLength: data.list.length,
      orgId: data.org_id,
      addNewAnchorsToGroup: data.add_new_anchors_to_group,
    });
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

  static async batchAddToAnchorFollowGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<BatchAddToAnchorFollowGroupRequest>();
    await batchAddToAnchorFollowGroup(data);
    ctx.body = ctx.t('Success');
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
    const data = ctx.getRequestData<
      GetAnchorCommentTemplateListRequest & {
        org_id: string;
      }
    >();
    ctx.body = await getAnchorCommentTemplateList(data);
    await next();
  }

  static async createAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      CreateAnchorCommentTemplateRequest & {
        org_id: string;
      }
    >();
    ctx.body = await createAnchorCommentTemplate(data);
    await next();
  }

  static async updateAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      UpdateAnchorCommentTemplateRequest & {
        org_id: string;
      }
    >();
    await updateAnchorCommentTemplate(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      DeleteAnchorCommentTemplateRequest & {
        org_id: string;
      }
    >();
    ctx.body = await deleteAnchorCommentTemplate(data);
    await next();
  }

  static async clearAnchorCommentTemplate(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      ClearAnchorCommentTemplateRequest & {
        org_id: string;
      }
    >();
    ctx.body = await clearAnchorCommentTemplate(data);
    await next();
  }

  // 评论模板分组相关接口
  static async getAnchorCommentTemplateGroupList(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      GetAnchorCommentTemplateGroupListRequest & {
        org_id: string;
      }
    >();
    ctx.body = await getAnchorCommentTemplateGroupList(data);
    await next();
  }

  static async getAnchorCommentTemplateGroupById(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      GetAnchorCommentTemplateGroupByIdRequest & {
        org_id: string;
      }
    >();
    ctx.body = await getAnchorCommentTemplateGroupById(data);
    await next();
  }

  static async createAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      CreateAnchorCommentTemplateGroupRequest & {
        org_id: string;
      }
    >();
    ctx.body = await createAnchorCommentTemplateGroup(data);
    await next();
  }

  static async updateAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      UpdateAnchorCommentTemplateGroupRequest & {
        org_id: string;
      }
    >();
    await updateAnchorCommentTemplateGroup(data);
    ctx.body = ctx.t('Success');
    await next();
  }

  static async deleteAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      DeleteAnchorCommentTemplateGroupRequest & {
        org_id: string;
      }
    >();
    ctx.body = await deleteAnchorCommentTemplateGroup(data);
    await next();
  }

  static async clearAnchorCommentTemplateGroup(ctx: Context, next: Next) {
    const data = ctx.getRequestData<
      ClearAnchorCommentTemplateGroupRequest & {
        org_id: string;
      }
    >();
    ctx.body = await clearAnchorCommentTemplateGroup(data);
    await next();
  }
}
