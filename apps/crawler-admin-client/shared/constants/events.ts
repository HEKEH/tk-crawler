export const CUSTOM_EVENTS = {
  // LIVE_ANCHOR_CRAWLER_SETTING: 'live-anchor-crawler-setting',
  // SUBMIT_LIVE_ANCHOR_CRAWLER_SETTING: 'submit-live-anchor-crawler-setting',
  CHECK_COOKIE_VALIDITY: 'check-cookie-validity',
  OPEN_TIKTOK_LOGIN_PAGE: 'open-tiktok-login-page',
  TIKTOK_COOKIE_UPDATED: 'tiktok-cookie-updated',
  TIKTOK_COOKIE_OUTDATED: 'tiktok-cookie-outdated',
  // 请求错误，一般是vpn问题
  CRAWL_REQUEST_ERROR: 'crawl-request-error',
  CLEAR_TIKTOK_COOKIE: 'clear-tiktok-cookie',
};

export const TOKEN_EVENTS = {
  GET_TOKEN: 'get-token',
  SET_TOKEN: 'set-token',
  REMOVE_TOKEN: 'remove-token',
};

export const CRAWL_EVENTS = {
  START_LIVE_ANCHOR_CRAWL: 'start-live-anchor-crawl',
  STOP_LIVE_ANCHOR_CRAWL: 'stop-live-anchor-crawl',
  ANCHOR_CRAWLED: 'anchor-crawled',
  GET_CRAWL_STATUS: 'get-crawl-status',
  GET_CRAWL_AREA: 'get-crawl-area',
  SET_CRAWL_AREA: 'set-crawl-area',
};
