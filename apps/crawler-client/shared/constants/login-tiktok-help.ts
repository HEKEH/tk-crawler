export const LOGIN_TIKTOK_HELP_EVENTS = {
  GET_LOGIN_TIKTOK_STATUS: 'get-login-tiktok-status',
  RETRY_OPEN_TIKTOK_LOGIN_PAGE: 'retry-open-tiktok-login-page',
};

export enum LOGIN_TIKTOK_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
}
