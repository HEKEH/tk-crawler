export enum IsCookieValidResultStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  ECONNRESET = 'econnreset',
  TIMEOUT = 'timeout',
  OTHER_ERROR = 'other_error',
}

export type IsCookieValidResult = IsCookieValidResultStatus;
