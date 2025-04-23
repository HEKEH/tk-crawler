import {
  BROWSER_NAME,
  BROWSER_VERSION,
  DefaultRegion,
  Region,
  TIKTOK_URL,
  USER_AGENT,
} from '@tk-crawler/biz-shared';
import {
  getRandomArrayElement,
  getRandomArrayElementWithWeight,
} from '@tk-crawler/shared';

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

const BASE_DEVICE_ID = '7451966978395973866';
const BASE_HISTORY_LEN = getRandomArrayElement([2, 3, 4, 5]);

const COMMON_TIKTOK_QUERY = {
  aid: '1988',
  app_name: 'tiktok_web',
  browser_name: BROWSER_NAME,
  browser_online: 'true',
  browser_platform: 'MacIntel',
  browser_version: BROWSER_VERSION,
  channel: 'tiktok_web',
  cookie_enabled: 'true',
  data_collection_enabled: 'false',
  device_platform: 'web_pc',
  device_type: 'web_h265',
  focus_state: 'false',
  from_page: 'user',
  hidden_banner: 'true',
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

let queryCount = 0;
let currentDynamicQuery = {
  ...COMMON_TIKTOK_QUERY,
  device_id: BASE_DEVICE_ID,
  history_len: BASE_HISTORY_LEN,
};

export function getDynamicCommonTiktokQuery() {
  queryCount++;
  if (queryCount > 1000) {
    queryCount = 0;
    const deviceId = (
      BigInt(BASE_DEVICE_ID) + BigInt(Math.ceil(Math.random() * 1000000))
    ).toString();
    let historyLen = currentDynamicQuery.history_len + 1;
    if (historyLen > 12) {
      historyLen = getRandomArrayElement([2, 3, 4, 5]);
    }
    currentDynamicQuery = {
      ...COMMON_TIKTOK_QUERY,
      device_id: deviceId,
      history_len: historyLen,
    };
  }
  return currentDynamicQuery;
}

export const TIKTOK_REGION_PARAMS_MAP = new Proxy(
  {
    [Region.US]: {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
      params: {
        priority_region: Region.US,
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
        priority_region: Region.CN,
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
        priority_region: Region.GB,
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
        priority_region: Region.ES,
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
        priority_region: Region.FR,
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
        priority_region: Region.DE,
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
        priority_region: Region.IT,
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
        priority_region: Region.RU,
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
        priority_region: Region.JP,
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
        priority_region: Region.KR,
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
        priority_region: Region.BR,
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
        priority_region: Region.PT,
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
        priority_region: Region.SA,
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
        priority_region: Region.AU,
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
        priority_region: Region.CA,
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
        priority_region: Region.IN,
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
        priority_region: Region.ID,
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
        priority_region: Region.MX,
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
        priority_region: Region.TH,
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
        priority_region: Region.VN,
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
            priority_region: prop as Region,
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
      priority_region: Region;
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
  const len = region.length;
  // 越排前面的优先级越高
  const elements: Readonly<[Region, number][]> = region.map((item, index) => [
    item,
    len - index,
  ]);
  const randomRegion = getRandomArrayElementWithWeight(elements);
  return TIKTOK_REGION_PARAMS_MAP[randomRegion || 'all'];
}
