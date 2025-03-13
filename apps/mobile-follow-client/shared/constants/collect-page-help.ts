export const COLLECT_PAGE_HELP_EVENTS = {
  GET_STATUS: 'collect:get-status',
  GET_RUNNING_STATUS: 'collect:get-running-status',
  REFRESH_RUNNING_STATUS: 'collect:refresh-running-status',
  RETRY_OPEN_PAGE: 'collect:retry-open-page',
  BACK_TO_MAIN_VIEW: 'collect:back-to-main-view',
  ANCHOR_LIST_FETCHED: 'collect:anchor-list-fetched',
};

export enum COLLECT_PAGE_HELP_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
  opened = 'opened',
}

export enum COLLECT_PAGE_HELP_RUNNING_STATUS {
  stateless = 'stateless',
  not_login = 'not_login',
  running = 'running',
}

export const COLLECT_PAGE_HELP_WIDTH = 350;
