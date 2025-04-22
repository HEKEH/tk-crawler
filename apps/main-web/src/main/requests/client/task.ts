import type {
  AnchorContactedRequest,
  AnchorContactedResponse,
  AssignTaskRequest,
  AssignTaskResponse,
  CancelClaimTaskRequest,
  CancelClaimTaskResponse,
  ClaimTaskRequest,
  ClaimTaskResponse,
} from '@tk-crawler/biz-shared';
import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function assignTask(params: AssignTaskRequest, token: string) {
  return commonRequest<AssignTaskResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/task/assign',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function claimTask(params: ClaimTaskRequest, token: string) {
  return commonRequest<ClaimTaskResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/task/claim',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function cancelClaimTask(params: CancelClaimTaskRequest, token: string) {
  return commonRequest<CancelClaimTaskResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/task/cancel-claim',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function anchorContacted(params: AnchorContactedRequest, token: string) {
  return commonRequest<AnchorContactedResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/task/anchor-contacted',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function cancelAnchorContact(
  params: AnchorContactedRequest,
  token: string,
) {
  return commonRequest<AnchorContactedResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/task/cancel-anchor-contact',
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
