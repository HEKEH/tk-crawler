import type {
  ClearAnchorFollowGroupRequest,
  ClearAnchorFollowGroupResponse,
  ClearAnchorFrom87Request,
  ClearAnchorFrom87Response,
  CreateAnchorFollowGroupRequest,
  CreateAnchorFollowGroupResponse,
  CreateOrUpdateAnchorFrom87Request,
  CreateOrUpdateAnchorFrom87Response,
  DeleteAnchorFollowGroupRequest,
  DeleteAnchorFollowGroupResponse,
  DeleteAnchorFrom87Request,
  DeleteAnchorFrom87Response,
  GetAnchorFollowGroupListRequest,
  GetAnchorFollowGroupListResponse,
  GetAnchorFollowGroupRequest,
  GetAnchorFollowGroupResponse,
  GetAnchorFollowGroupWithAnchorIdsRequest,
  GetAnchorFollowGroupWithAnchorIdsResponse,
  GetAnchorFrom87ListRequest,
  GetAnchorFrom87ListResponse,
  UpdateAnchorFollowGroupRequest,
  UpdateAnchorFollowGroupResponse,
} from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

// 主播相关请求
export function getAnchorFrom87List(
  params: GetAnchorFrom87ListRequest,
): Promise<GetAnchorFrom87ListResponse> {
  return commonRequest<GetAnchorFrom87ListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-anchor-list',
    params,
  });
}

export function createOrUpdateAnchorFrom87(
  params: CreateOrUpdateAnchorFrom87Request,
): Promise<CreateOrUpdateAnchorFrom87Response> {
  return commonRequest<CreateOrUpdateAnchorFrom87Response>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/create-or-update-anchor',
    params,
  });
}

export function deleteAnchorFrom87(
  params: DeleteAnchorFrom87Request,
): Promise<DeleteAnchorFrom87Response> {
  return commonRequest<DeleteAnchorFrom87Response>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/delete-anchor',
    params,
  });
}

export function clearAnchorFrom87(
  params: ClearAnchorFrom87Request,
): Promise<ClearAnchorFrom87Response> {
  return commonRequest<ClearAnchorFrom87Response>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/clear-anchor',
    params,
  });
}

// 分组相关请求
export function getAnchorFollowGroupList(
  params: GetAnchorFollowGroupListRequest,
): Promise<GetAnchorFollowGroupListResponse> {
  return commonRequest<GetAnchorFollowGroupListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-group-list',
    params,
  });
}

export function getAnchorFollowGroup(
  params: GetAnchorFollowGroupRequest,
): Promise<GetAnchorFollowGroupResponse> {
  return commonRequest<GetAnchorFollowGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-group',
    params,
  });
}

export function getAnchorFollowGroupWithAnchorIds(
  params: GetAnchorFollowGroupWithAnchorIdsRequest,
): Promise<GetAnchorFollowGroupWithAnchorIdsResponse> {
  return commonRequest<GetAnchorFollowGroupWithAnchorIdsResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/get-group-with-anchor-ids',
    params,
  });
}

export function createAnchorFollowGroup(
  params: CreateAnchorFollowGroupRequest,
): Promise<CreateAnchorFollowGroupResponse> {
  return commonRequest<CreateAnchorFollowGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/create-group',
    params,
  });
}

export function updateAnchorFollowGroup(
  params: UpdateAnchorFollowGroupRequest,
): Promise<UpdateAnchorFollowGroupResponse> {
  return commonRequest<UpdateAnchorFollowGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/update-group',
    params,
  });
}

export function deleteAnchorFollowGroup(
  params: DeleteAnchorFollowGroupRequest,
): Promise<DeleteAnchorFollowGroupResponse> {
  return commonRequest<DeleteAnchorFollowGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/delete-group',
    params,
  });
}

export function clearAnchorFollowGroup(
  params: ClearAnchorFollowGroupRequest,
): Promise<ClearAnchorFollowGroupResponse> {
  return commonRequest<ClearAnchorFollowGroupResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/clear-group',
    params,
  });
}
