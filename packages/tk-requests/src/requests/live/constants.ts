import {
  BROWSER_NAME,
  BROWSER_VERSION,
  DefaultRegion,
  Region,
  TIKTOK_URL,
  USER_AGENT,
} from '@tk-crawler/biz-shared';
import { getRandomArrayElement } from '@tk-crawler/shared';

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
    [Region.ES]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.ES,
        tz_name: 'Europe/Madrid',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.FR]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.FR,
        tz_name: 'Europe/Paris',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.DE]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.DE,
        tz_name: 'Europe/Berlin',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.IT]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.IT,
        tz_name: 'Europe/Rome',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.RU]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.RU,
        tz_name: 'Europe/Moscow',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.JP]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.JP,
        tz_name: 'Asia/Tokyo',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.KR]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.KR,
        tz_name: 'Asia/Seoul',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.BR]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.BR,
        tz_name: 'America/Sao_Paulo',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.PT]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.PT,
        tz_name: 'Europe/Lisbon',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.SA]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.SA,
        tz_name: 'Asia/Riyadh',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.AU]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.AU,
        tz_name: 'Australia/Sydney',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.CA]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.CA,
        tz_name: 'America/Toronto',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.IN]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.IN,
        tz_name: 'Asia/Kolkata',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.ID]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.ID,
        tz_name: 'Asia/Jakarta',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.MX]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.MX,
        tz_name: 'America/Mexico_City',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.TH]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.TH,
        tz_name: 'Asia/Bangkok',
        browser_language: 'en-US',
        app_language: 'en',
        webcast_language: 'en',
      },
    },
    [Region.VN]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        region: Region.VN,
        tz_name: 'Asia/Ho_Chi_Minh',
        browser_language: 'en-US',
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
        return {
          headers: {
            'accept-language': 'en-US,en;q=0.9',
          },
          params: {
            region: prop as Region,
            tz_name: 'Asia/Shanghai',
            browser_language: 'en-US',
            app_language: 'en',
            webcast_language: 'en',
          },
        };
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
