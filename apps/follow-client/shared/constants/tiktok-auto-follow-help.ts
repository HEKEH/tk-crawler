export const TIKTOK_AUTO_FOLLOW_PAGE_EVENTS = {
  GET_STATUS: 'auto-follow:get-status',
  RETRY_OPEN_PAGE: 'auto-follow:retry-open-page',
};

export enum TIKTOK_AUTO_FOLLOW_PAGE_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
  opened = 'opened',
}

export const TIKTOK_AUTO_FOLLOW_HELP_WIDTH = 350;
