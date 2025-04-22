import type {
  CreateOrgMemberRequest,
  CreateOrgMemberResponse,
  DeleteOrgMemberRequest,
  DeleteOrgMemberResponse,
  GetOrgMemberListRequest,
  GetOrgMemberListResponse,
  UpdateOrgMemberRequest,
  UpdateOrgMemberResponse,
} from '@tk-crawler/biz-shared';

import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getOrgMemberList(
  params: Omit<GetOrgMemberListRequest, 'org_id'>,
  token: string,
) {
  return commonRequest<GetOrgMemberListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/org-and-user/get-org-member-list',
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/org-and-user/create-org-member',
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/org-and-user/update-org-member',
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
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/org-and-user/delete-org-member',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
