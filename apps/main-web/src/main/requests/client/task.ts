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
import {
  AnchorContacted,
  AssignTask,
  CancelAnchorContact,
  CancelClaimTask,
  ClaimTask,
  OwnServerUrl,
  Post,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function assignTask(params: AssignTaskRequest, token: string) {
  return commonRequest<AssignTaskResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: AssignTask,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function claimTask(params: ClaimTaskRequest, token: string) {
  return commonRequest<ClaimTaskResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: ClaimTask,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function cancelClaimTask(params: CancelClaimTaskRequest, token: string) {
  return commonRequest<CancelClaimTaskResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: CancelClaimTask,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function anchorContacted(params: AnchorContactedRequest, token: string) {
  return commonRequest<AnchorContactedResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: AnchorContacted,
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
    baseURL: config[OwnServerUrl],
    method: Post,
    path: CancelAnchorContact,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
