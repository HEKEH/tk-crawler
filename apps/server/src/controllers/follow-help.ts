import type {
  ClearAnchorFollowGroupRequest,
  ClearAnchorFrom87Request,
  CreateAnchorFollowGroupRequest,
  CreateOrUpdateAnchorFrom87Request,
  DeleteAnchorFollowGroupRequest,
  DeleteAnchorFrom87Request,
  GetAnchorFollowGroupListRequest,
  GetAnchorFollowGroupRequest,
  GetAnchorFollowGroupWithAnchorIdsRequest,
  GetAnchorFrom87ListRequest,
  UpdateAnchorFollowGroupRequest,
} from '@tk-crawler/biz-shared';
import type { Context, Next } from 'koa';
import {
  clearAnchorFollowGroup,
  clearAnchorFrom87,
  createAnchorFollowGroup,
  createOrUpdateAnchorFrom87,
  deleteAnchorFollowGroup,
  deleteAnchorFrom87,
  getAnchorFollowGroup,
  getAnchorFollowGroupList,
  getAnchorFollowGroupWithAnchorIds,
  getAnchorFrom87List,
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
}
