import type { CollectedAnchorInfo } from './anchor';

export enum RESPONSE_CODE {
  SUCCESS = 0,
  BIZ_ERROR = 1,
  SERVER_ERROR = 2,
}

export interface ShouldUpdateAnchorRequest {
  anchor_id: string;
}

/** 1: 需要更新 0: 不需要更新 */
export type ShouldUpdateAnchorResponseData = 1 | 0;

export interface ShouldUpdateAnchorResponse {
  status_code: RESPONSE_CODE;
  data?: ShouldUpdateAnchorResponseData;
  message?: string;
}

export type UpdateAnchorRequest = CollectedAnchorInfo;

export interface UpdateAnchorResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
