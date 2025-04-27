import type { TkAccount } from '@tk-crawler/biz-shared';

export enum IsCookieValidResultStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  ECONNRESET = 'econnreset',
  TIMEOUT = 'timeout',
  OTHER_ERROR = 'other_error',
}

export interface IsCookieValidResult {
  status: IsCookieValidResultStatus;
  data?: TkAccount;
}
