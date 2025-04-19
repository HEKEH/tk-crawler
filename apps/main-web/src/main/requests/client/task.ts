import type {
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
import { redirectToLogin } from '../../router';

export function assignTask(params: AssignTaskRequest, token: string) {
  return commonRequest<AssignTaskResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/client/task/assign',
    params,
    onTokenInvalid: redirectToLogin,
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
    onTokenInvalid: redirectToLogin,
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
    onTokenInvalid: redirectToLogin,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
