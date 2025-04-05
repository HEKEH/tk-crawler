export const GUILD_COOKIE_PAGE_HELP_EVENTS = {
  GET_STATUS: 'guild-cookie:get-status',
  GET_RUNNING_STATUS: 'guild-cookie:get-running-status',
  REFRESH_RUNNING_STATUS: 'guild-cookie:refresh-running-status',
  RETRY_OPEN_PAGE: 'guild-cookie:retry-open-page',
  BACK_TO_MAIN_VIEW: 'guild-cookie:back-to-main-view',
};

export enum GUILD_COOKIE_PAGE_HELP_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
  opened = 'opened',
}

export enum GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS {
  stateless = 'stateless',
  not_login = 'not_login',
  logged_in = 'logged_in',
  unknown = 'unknown',
}

export const GUILD_COOKIE_PAGE_HELP_WIDTH = 350;
