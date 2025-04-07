import {
  BROWSER_NAME,
  BROWSER_VERSION,
  DefaultRegion,
  Region,
  USER_AGENT,
} from '@tk-crawler/biz-shared';
import { getRandomArrayElement } from '@tk-crawler/shared';

export const TIKTOK_URL = 'https://www.tiktok.com';
export const TIKTOK_WEBCAST_URL = 'https://webcast.tiktok.com';
export const COMMON_TIKTOK_HEADERS = {
  accept: '*/*',
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
  browser_name: BROWSER_NAME,
  browser_online: 'true',
  browser_platform: 'MacIntel',
  browser_version: BROWSER_VERSION,
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
  req_from: 'pc_web_suggested_host',
  screen_height: '1440',
  screen_width: '2560',
  user_is_login: 'false',
};

export const TIKTOK_REGION_PARAMS_MAP = new Proxy(
  {
    [Region.US]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.US,
        tz_name: 'America/New_York',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.CN]: {
      headers: {
        'accept-language': 'zh-CN,zh;q=0.9',
      },
      params: {
        region: Region.CN,
        tz_name: 'Asia/Shanghai',
        browser_language: 'zh-CN',
        app_language: 'zh-Hans',
        webcast_language: 'zh-Hans',
      },
    },
    [Region.GB]: {
      headers: {
        'accept-language': 'en-GB,en;q=0.9',
      },
      params: {
        region: Region.GB,
        tz_name: 'Europe/London',
        browser_language: 'en-GB',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
  },
  {
    get: (target, prop) => {
      if (prop === 'all') {
        return target[DefaultRegion];
      }
      const res = target[prop as keyof typeof target];
      if (!res) {
        return target[DefaultRegion];
      }
      return res;
    },
  },
) as {
  [key in Region | 'all']: {
    headers: {
      'accept-language': string;
    };
    params: {
      region: Region;
      tz_name: string;
      browser_language: string;
      app_language: string;
      webcast_language: string;
    };
  };
};

export function getTiktokRegionParams(region: Region[] | 'all') {
  if (region === 'all') {
    return TIKTOK_REGION_PARAMS_MAP.all;
  }
  return TIKTOK_REGION_PARAMS_MAP[getRandomArrayElement(region) || 'all'];
}
