export const TIKTOK_AUTO_FOLLOW_PAGE_EVENTS = {
  GET_STATUS: 'auto-follow:get-status',
  RETRY_OPEN_PAGE: 'auto-follow:retry-open-page',

  // 自动关注相关事件
  GET_RUNNING_STATUS: 'auto-follow:get-running-status',
  START_AUTO_FOLLOW: 'auto-follow:start-auto-follow',
  PAUSE_AUTO_FOLLOW: 'auto-follow:pause-auto-follow',
  CLOSE_AND_BACK: 'auto-follow:stop-auto-follow',
  CONTINUE_AUTO_FOLLOW: 'auto-follow:continue-auto-follow',

  // 后台返回关注结果到前台
  AUTO_FOLLOWED_RESULT: 'auto-follow:auto-followed-result',
};

export enum AUTO_FOLLOWED_RESULT_TYPE {
  SUCCESS = 'success',
  FAIL = 'fail',
  NOT_FOUND = 'not_found',
  ALREADY_FOLLOWED = 'already_followed',
}

export enum TIKTOK_AUTO_FOLLOW_PAGE_STATUS {
  stateless = 'stateless',
  loading = 'loading',
  timeout = 'timeout',
  fail = 'fail',
  opened = 'opened',
}

export enum TIKTOK_AUTO_FOLLOW_RUNNING_STATUS {
  not_started = 'not_started',
  running = 'running',
  paused = 'paused',
  completed = 'completed',
}

export const TIKTOK_AUTO_FOLLOW_HELP_WIDTH = 350;
