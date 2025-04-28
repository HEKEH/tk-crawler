import { TKGuildUserStatus } from '../types';
import { TIKTOK_LIVE_ADMIN_URL } from './url';
import { USER_AGENT } from './user-agent';

export const COMMON_TIKTOK_LIVE_ADMIN_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  'content-type': 'application/json',
  origin: TIKTOK_LIVE_ADMIN_URL,
  pragma: 'no-cache',
  priority: 'u=1, i',
  referer: `${TIKTOK_LIVE_ADMIN_URL}/portal/overview`,
  'sec-ch-ua':
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': USER_AGENT,
  'x-appid': '1180',
  'x-csrf-token': 'undefined',
  'x-language': 'zh-CN',
};

export const VALID_GUILD_USER_STATUS_LIST = [
  TKGuildUserStatus.RUNNING,
  TKGuildUserStatus.WAITING,
  TKGuildUserStatus.WARNING,
];

export const ANCHOR_CHECK_OUTDATE_DAYS = 7;
