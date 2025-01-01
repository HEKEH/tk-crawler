import type { WithRegion } from '../types';
import type { TikTokQueryTokens } from './types';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  TIKTOK_REGION_PARAMS_MAP,
  TIKTOK_WEBCAST_URL,
} from './constants';
import { commonGetRequest } from './utils/common-request';
import { getUrl } from './utils/get-url';
import { getXBogus } from './utils/params';

export interface DrawerSubTab {
  cover_url: string;
  position: number;
  rank_type: 'hot_game' | '';
  tab_name: string;
  tab_type: string;
  viewer_count: number;
}

export interface DrawerTabsResponse {
  status_code: number;
  data?: {
    is_not_show_tab: boolean;
    sub_tabs: DrawerSubTab[];
    tab_name: string;
    tab_type: 'lifestyle' | 'gaming' | 'category' | 'setting_section';
  }[];
  message?: string;
  extra?: {
    now: number;
  };
}

export enum DRAWER_TABS_SCENE {
  INIT = 0,
  UPDATE = 1,
}

export const DRAWER_TABS_SCENES = Object.values(DRAWER_TABS_SCENE).filter(
  value => typeof value === 'number',
) as DRAWER_TABS_SCENE[];

/** 获取频道对应的tag列表 */
export default async function getDrawerTabs({
  region,
  tokens,
  scene,
}: WithRegion<{ tokens: TikTokQueryTokens; scene: DRAWER_TABS_SCENE }>) {
  const { headers, params } = TIKTOK_REGION_PARAMS_MAP[region];
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/feed/drawer_tabs/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      ...params,
      scene,
      ...tokens,
    },
  });
  const xBogus = getXBogus(url);
  return commonGetRequest<DrawerTabsResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...headers,
    },
  });
}
