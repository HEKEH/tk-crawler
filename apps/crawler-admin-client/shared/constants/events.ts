export const CUSTOM_EVENTS = {
  // LIVE_ANCHOR_CRAWLER_SETTING: 'live-anchor-crawler-setting',
  // SUBMIT_LIVE_ANCHOR_CRAWLER_SETTING: 'submit-live-anchor-crawler-setting',
  CHECK_COOKIE_VALIDITY: 'check-cookie-validity',
  RECHECK_COOKIE_VALIDITY: 'recheck-cookie-validity',
  OPEN_TIKTOK_LOGIN_PAGE: 'open-tiktok-login-page',
  TIKTOK_COOKIE_UPDATED: 'tiktok-cookie-updated',
  TIKTOK_COOKIE_OUTDATED: 'tiktok-cookie-outdated',
  // 请求错误，一般是vpn问题
  CRAWL_REQUEST_ERROR: 'crawl-request-error',
};

export const TOKEN_EVENTS = {
  GET_TOKEN: 'get-token',
  SET_TOKEN: 'set-token',
  REMOVE_TOKEN: 'remove-token',
};

export const SETTINGS_EVENTS = {
  SET_SETTINGS: 'set-settings',
  GET_SETTINGS: 'get-settings',
};

export const CRAWL_EVENTS = {
  START_LIVE_ANCHOR_CRAWL: 'start-live-anchor-crawl',
  STOP_LIVE_ANCHOR_CRAWL: 'stop-live-anchor-crawl',
  ANCHOR_UPDATED: 'anchor-updated',
  ANCHORS_CRAWLED_NUMBER: 'anchors-crawled-number',
  GET_CRAWL_STATUS: 'get-crawl-status',
  GET_CRAWL_AREA: 'get-crawl-area',
  SET_CRAWL_AREA: 'set-crawl-area',
  GET_TK_COOKIE: 'get-tk-cookie',
  SET_TK_COOKIE: 'set-tk-cookie',
  CLEAR_TIKTOK_COOKIE: 'clear-tiktok-cookie',
  GET_SIMPLE_CRAWL_STATISTICS: 'get-simple-crawl-statistics',
};
