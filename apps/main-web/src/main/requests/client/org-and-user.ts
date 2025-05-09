import type {
  CreateOrgMemberRequest,
  CreateOrgMemberResponse,
  DeleteOrgMemberRequest,
  DeleteOrgMemberResponse,
  GetOrgMemberListRequest,
  GetOrgMemberListResponse,
  UpdateOrgAnchorSearchPoliciesRequest,
  UpdateOrgAnchorSearchPoliciesResponse,
  UpdateOrgMemberRequest,
  UpdateOrgMemberResponse,
} from '@tk-crawler/biz-shared';

import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import {
  CreateOrgMember,
  DeleteOrgMember,
  GetOrgMemberList,
  OwnServerUrl,
  Post,
  UpdateOrgAnchorSearchPolicies,
  UpdateOrgMember,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getOrgMemberList(
  params: Omit<GetOrgMemberListRequest, 'org_id'>,
  token: string,
) {
  return commonRequest<GetOrgMemberListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: GetOrgMemberList,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function createOrgMember(
  params: Omit<CreateOrgMemberRequest, 'org_id'>,
  token: string,
) {
  return commonRequest<CreateOrgMemberResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: CreateOrgMember,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function updateOrgMember(
  params: UpdateOrgMemberRequest['data'],
  token: string,
) {
  return commonRequest<UpdateOrgMemberResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: UpdateOrgMember,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function deleteOrgMember(
  params: Omit<DeleteOrgMemberRequest, 'org_id'>,
  token: string,
) {
  return commonRequest<DeleteOrgMemberResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: DeleteOrgMember,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function updateOrgAnchorSearchPolicies(
  params: UpdateOrgAnchorSearchPoliciesRequest,
  token: string,
) {
  return commonRequest<UpdateOrgAnchorSearchPoliciesResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: UpdateOrgAnchorSearchPolicies,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
