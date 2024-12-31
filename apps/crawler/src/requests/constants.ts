import { LANGUAGE } from '../constants';

export const TIKTOK_URL = 'https://www.tiktok.com';
export const TIKTOK_WEBCAST_URL = 'https://webcast.tiktok.com';
export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
export const COMMON_TIKTOK_HEADERS = {
  accept: '*/*',
  'accept-language': 'zh-CN,zh;q=0.9',
  'cache-control': 'no-cache',
  origin: TIKTOK_URL,
  pragma: 'no-cache',
  priority: 'u=1, i',
  referer: TIKTOK_URL,
  'sec-ch-ua':
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': USER_AGENT,
};

export enum ChannelId {
  GAMING_WITH_TAG = 1111006,
  LIFESTYLE_WITH_TAG = 1222001,
  SUGGESTED = 86,
  RECOMMEND = 87,
  GAMING = 89,
}

export const CHANNEL_IDS = Object.values(ChannelId).filter(
  value => typeof value === 'number',
) as ChannelId[];

export const COMMON_TIKTOK_QUERY = {
  aid: '1988',
  app_name: 'tiktok_web',
  browser_name: 'Mozilla',
  browser_online: 'true',
  browser_platform: 'MacIntel',
  browser_version:
    '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  channel: 'tiktok_web',
  cookie_enabled: 'true',
  data_collection_enabled: 'false',
  device_id: '7451966978406073866',
  device_platform: 'web_pc',
  device_type: 'web_h265',
  focus_state: 'false',
  from_page: 'user',
  hidden_banner: 'true',
  history_len: '5',
  is_fullscreen: 'true',
  is_non_personalized: '0',
  is_page_visible: 'true',
  max_time: '0',
  os: 'mac',
  priority_region: '',
  referer: '',
  region: 'SG',
  req_from: 'pc_web_suggested_host',
  screen_height: '1440',
  screen_width: '2560',
  tz_name: 'Asia/Shanghai',
  user_is_login: 'false',
};

export const TIKTOK_LANGUAGE_MAP = {
  [LANGUAGE['ZH-CN']]: {
    browser_language: 'zh-CN',
    app_language: 'zh-Hans',
    webcast_language: 'zh-Hans',
  },
};
