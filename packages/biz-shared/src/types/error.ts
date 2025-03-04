/** 请求错误类型 */
export enum RequestErrorType {
  /** tiktok 请求连接重置 */
  TIKTOK_REQUEST_ECONNRESET = 'TIKTOK_REQUEST_ECONNRESET',
  /** tiktok 请求超时 */
  TIKTOK_REQUEST_TIMEOUT = 'TIKTOK_REQUEST_TIMEOUT',
  /** 其他请求错误 */
  NORMAL_REQUEST_ERROR = 'NORMAL_REQUEST_ERROR',
}
