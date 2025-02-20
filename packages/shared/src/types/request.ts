import type { CollectedAnchorInfo } from './anchor';

export enum RESPONSE_CODE {
  SUCCESS = 0,
  BIZ_ERROR = 1,
  SERVER_ERROR = 2,
}

export interface ShouldUpdateAnchorRequest {
  anchor_ids: string[];
}

export enum ShouldUpdateAnchorResult {
  NEED_UPDATE = 1,
  NO_NEED_UPDATE = 0,
}

export type ShouldUpdateAnchorResponseData = Record<
  string,
  ShouldUpdateAnchorResult
>;

export interface ShouldUpdateAnchorResponse {
  status_code: RESPONSE_CODE;
  data?: ShouldUpdateAnchorResponseData;
  message?: string;
}

export interface RecordAnchorCrawlRequest {
  anchor_id: string;
}

export interface RecordAnchorCrawlResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface DeleteAnchorCrawlRecordRequest {
  anchor_id: string;
}

export interface DeleteAnchorCrawlRecordResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export type UpdateAnchorRequest = CollectedAnchorInfo;

export interface UpdateAnchorResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
