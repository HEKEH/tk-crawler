import type {
  ClearAnchorCommentTemplateGroupRequest,
  ClearAnchorCommentTemplateGroupResponse,
  ClearAnchorCommentTemplateRequest,
  ClearAnchorCommentTemplateResponse,
  CreateAnchorCommentTemplateGroupRequest,
  CreateAnchorCommentTemplateGroupResponse,
  CreateAnchorCommentTemplateRequest,
  CreateAnchorCommentTemplateResponse,
  DeleteAnchorCommentTemplateGroupRequest,
  DeleteAnchorCommentTemplateGroupResponse,
  DeleteAnchorCommentTemplateRequest,
  DeleteAnchorCommentTemplateResponse,
  GetAnchorCommentTemplateGroupByIdRequest,
  GetAnchorCommentTemplateGroupByIdResponse,
  GetAnchorCommentTemplateGroupListRequest,
  GetAnchorCommentTemplateGroupListResponse,
  GetAnchorCommentTemplateListRequest,
  GetAnchorCommentTemplateListResponse,
  UpdateAnchorCommentTemplateGroupRequest,
  UpdateAnchorCommentTemplateGroupResponse,
  UpdateAnchorCommentTemplateRequest,
  UpdateAnchorCommentTemplateResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

// 评论模板相关请求
export function getAnchorCommentTemplateList(
  params: GetAnchorCommentTemplateListRequest & {
    org_id: string;
  },
): Promise<GetAnchorCommentTemplateListResponse> {
  return commonRequest<GetAnchorCommentTemplateListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-comment-template-list',
    params,
  });
}

export function createAnchorCommentTemplate(
  params: CreateAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<CreateAnchorCommentTemplateResponse> {
  return commonRequest<CreateAnchorCommentTemplateResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/create-comment-template',
    params,
  });
}

export function updateAnchorCommentTemplate(
  params: UpdateAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<UpdateAnchorCommentTemplateResponse> {
  return commonRequest<UpdateAnchorCommentTemplateResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/update-comment-template',
    params,
  });
}

export function deleteAnchorCommentTemplate(
  params: DeleteAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<DeleteAnchorCommentTemplateResponse> {
  return commonRequest<DeleteAnchorCommentTemplateResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/delete-comment-template',
    params,
  });
}

export function clearAnchorCommentTemplate(
  params: ClearAnchorCommentTemplateRequest & {
    org_id: string;
  },
): Promise<ClearAnchorCommentTemplateResponse> {
  return commonRequest<ClearAnchorCommentTemplateResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/clear-comment-template',
    params,
  });
}

// 评论模板分组相关请求
export function getAnchorCommentTemplateGroupList(
  params: GetAnchorCommentTemplateGroupListRequest & {
    org_id: string;
  },
): Promise<GetAnchorCommentTemplateGroupListResponse> {
  return commonRequest<GetAnchorCommentTemplateGroupListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-comment-template-group-list',
    params,
  });
}

export function getAnchorCommentTemplateGroupById(
  params: GetAnchorCommentTemplateGroupByIdRequest & {
    org_id: string;
  },
): Promise<GetAnchorCommentTemplateGroupByIdResponse> {
  return commonRequest<GetAnchorCommentTemplateGroupByIdResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-comment-template-group',
    params,
  });
}

export function createAnchorCommentTemplateGroup(
  params: CreateAnchorCommentTemplateGroupRequest & {
    org_id: string;
  },
): Promise<CreateAnchorCommentTemplateGroupResponse> {
  return commonRequest<CreateAnchorCommentTemplateGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/create-comment-template-group',
    params,
  });
}

export function updateAnchorCommentTemplateGroup(
  params: UpdateAnchorCommentTemplateGroupRequest & {
    org_id: string;
  },
): Promise<UpdateAnchorCommentTemplateGroupResponse> {
  return commonRequest<UpdateAnchorCommentTemplateGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/update-comment-template-group',
    params,
  });
}

export function deleteAnchorCommentTemplateGroup(
  params: DeleteAnchorCommentTemplateGroupRequest & {
    org_id: string;
  },
): Promise<DeleteAnchorCommentTemplateGroupResponse> {
  return commonRequest<DeleteAnchorCommentTemplateGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/delete-comment-template-group',
    params,
  });
}

export function clearAnchorCommentTemplateGroup(
  params: ClearAnchorCommentTemplateGroupRequest & {
    org_id: string;
  },
): Promise<ClearAnchorCommentTemplateGroupResponse> {
  return commonRequest<ClearAnchorCommentTemplateGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/clear-comment-template-group',
    params,
  });
}
