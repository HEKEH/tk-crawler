export const TIKTOK_PAGES_HELP_EVENTS = {
  GET_LOGIN_TIKTOK_STATUS: 'get-login-tiktok-status',
  RETRY_OPEN_TIKTOK_PAGE: 'retry-open-tiktok-page',
};

export enum TIKTOK_PAGES_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
  opened = 'opened',
}

export const TIKTOK_PAGES_HELP_WIDTH = 350;
