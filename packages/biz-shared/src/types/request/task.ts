import type { RESPONSE_CODE } from '@tk-crawler/shared';

export interface AssignTaskRequest {
  anchor_check_ids: string[];
  guild_user_id: string;
}

export interface AssignTaskResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}

export interface ClaimTaskRequest {
  anchor_check_ids: string[];
}

export interface ClaimTaskResponse {
  status_code: RESPONSE_CODE;
  message?: string;
}
