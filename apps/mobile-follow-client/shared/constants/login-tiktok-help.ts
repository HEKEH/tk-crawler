export const LOGIN_TIKTOK_HELP_EVENTS = {
  GET_STATUS: 'login-tiktok:get-status',
  RETRY_OPEN_PAGE: 'login-tiktok:retry-open-page',
  LOGIN_CONFIRMED: 'login-tiktok:login-confirmed',
};

export enum LOGIN_TIKTOK_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
  opened = 'opened',
}

export const LOGIN_HELP_WIDTH = 350;
