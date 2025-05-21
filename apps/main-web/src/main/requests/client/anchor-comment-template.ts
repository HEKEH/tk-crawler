import {
  type ClearAnchorCommentTemplateGroupRequest,
  type ClearAnchorCommentTemplateGroupResponse,
  type ClearAnchorCommentTemplateRequest,
  type ClearAnchorCommentTemplateResponse,
  CLIENT_TOKEN_HEADER_KEY,
  type CreateAnchorCommentTemplateGroupRequest,
  type CreateAnchorCommentTemplateGroupResponse,
  type CreateAnchorCommentTemplateRequest,
  type CreateAnchorCommentTemplateResponse,
  type DeleteAnchorCommentTemplateGroupRequest,
  type DeleteAnchorCommentTemplateGroupResponse,
  type DeleteAnchorCommentTemplateRequest,
  type DeleteAnchorCommentTemplateResponse,
  type GetAnchorCommentTemplateGroupByIdRequest,
  type GetAnchorCommentTemplateGroupByIdResponse,
  type GetAnchorCommentTemplateGroupListRequest,
  type GetAnchorCommentTemplateGroupListResponse,
  type GetAnchorCommentTemplateListRequest,
  type GetAnchorCommentTemplateListResponse,
  type UpdateAnchorCommentTemplateGroupRequest,
  type UpdateAnchorCommentTemplateGroupResponse,
  type UpdateAnchorCommentTemplateRequest,
  type UpdateAnchorCommentTemplateResponse,
} from '@tk-crawler/biz-shared';

import {
  ClearCommentTemplate,
  ClearCommentTemplateGroup,
  CreateCommentTemplate,
  CreateCommentTemplateGroup,
  DeleteCommentTemplate,
  DeleteCommentTemplateGroup,
  GetCommentTemplateGroup,
  GetCommentTemplateGroupList,
  GetCommentTemplateList,
  OwnServerUrl,
  Post,
  UpdateCommentTemplate,
  UpdateCommentTemplateGroup,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

// 评论模板相关请求
export function getAnchorCommentTemplateList(
  params: GetAnchorCommentTemplateListRequest,
  token: string,
): Promise<GetAnchorCommentTemplateListResponse> {
  return commonRequest<GetAnchorCommentTemplateListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetCommentTemplateList,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function createAnchorCommentTemplate(
  params: CreateAnchorCommentTemplateRequest,
  token: string,
): Promise<CreateAnchorCommentTemplateResponse> {
  return commonRequest<CreateAnchorCommentTemplateResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: CreateCommentTemplate,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function updateAnchorCommentTemplate(
  params: UpdateAnchorCommentTemplateRequest,
  token: string,
): Promise<UpdateAnchorCommentTemplateResponse> {
  return commonRequest<UpdateAnchorCommentTemplateResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: UpdateCommentTemplate,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function deleteAnchorCommentTemplate(
  params: DeleteAnchorCommentTemplateRequest,
  token: string,
): Promise<DeleteAnchorCommentTemplateResponse> {
  return commonRequest<DeleteAnchorCommentTemplateResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: DeleteCommentTemplate,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function clearAnchorCommentTemplate(
  params: ClearAnchorCommentTemplateRequest,
  token: string,
): Promise<ClearAnchorCommentTemplateResponse> {
  return commonRequest<ClearAnchorCommentTemplateResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: ClearCommentTemplate,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

// 评论模板分组相关请求
export function getAnchorCommentTemplateGroupList(
  params: GetAnchorCommentTemplateGroupListRequest,
  token: string,
): Promise<GetAnchorCommentTemplateGroupListResponse> {
  return commonRequest<GetAnchorCommentTemplateGroupListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetCommentTemplateGroupList,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function getAnchorCommentTemplateGroupById(
  params: GetAnchorCommentTemplateGroupByIdRequest,
  token: string,
): Promise<GetAnchorCommentTemplateGroupByIdResponse> {
  return commonRequest<GetAnchorCommentTemplateGroupByIdResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetCommentTemplateGroup,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function createAnchorCommentTemplateGroup(
  params: CreateAnchorCommentTemplateGroupRequest,
  token: string,
): Promise<CreateAnchorCommentTemplateGroupResponse> {
  return commonRequest<CreateAnchorCommentTemplateGroupResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: CreateCommentTemplateGroup,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function updateAnchorCommentTemplateGroup(
  params: UpdateAnchorCommentTemplateGroupRequest,
  token: string,
): Promise<UpdateAnchorCommentTemplateGroupResponse> {
  return commonRequest<UpdateAnchorCommentTemplateGroupResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: UpdateCommentTemplateGroup,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function deleteAnchorCommentTemplateGroup(
  params: DeleteAnchorCommentTemplateGroupRequest,
  token: string,
): Promise<DeleteAnchorCommentTemplateGroupResponse> {
  return commonRequest<DeleteAnchorCommentTemplateGroupResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: DeleteCommentTemplateGroup,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function clearAnchorCommentTemplateGroup(
  params: ClearAnchorCommentTemplateGroupRequest,
  token: string,
): Promise<ClearAnchorCommentTemplateGroupResponse> {
  return commonRequest<ClearAnchorCommentTemplateGroupResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: ClearCommentTemplateGroup,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
