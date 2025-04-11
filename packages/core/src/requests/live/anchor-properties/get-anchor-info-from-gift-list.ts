import type { Region } from '@tk-crawler/biz-shared';
import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '@tk-crawler/tk-requests';
import { commonGetRequest } from '../../utils/common-request';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from '../constants';

export interface LiveGiftListResponse {
  status_code: number;
  extra?: {
    now: number;
  };
  data?: {
    pages: {
      region: Region | '';
    }[];
    gifts_info: {
      gift_gallery_info: {
        anchor_ranking_league: string;
        gallery_ranking_league: string;
      };
    };
  };
  message?: string;
}

export interface GetAnchorInfoFromGiftListResult {
  status_code: number;
  data?: {
    anchor_ranking_league: string;
    region: Region;
  };
  message?: string;
}

/** 获取主播直播段位、地区 */
export async function getAnchorInfoFromGiftList({
  region,
  tokens,
  roomId,
}: WithRegion<{
  tokens: TikTokQueryTokens;
  roomId: string;
}>): Promise<GetAnchorInfoFromGiftListResult> {
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams(region);
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/gift/list/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      ...regionParams,
      room_id: roomId,
      ...tokens,
    },
  });
  const xBogus = getXBogus(url);
  const response = await commonGetRequest<LiveGiftListResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
    },
  });
  if (response.status_code === 0) {
    const anchorRankLeague = response.data?.gifts_info?.gift_gallery_info
      ?.anchor_ranking_league as string;
    const region = response.data?.pages
      .map(page => page.region)
      .find(Boolean) as Region;
    return {
      status_code: 0,
      data: { anchor_ranking_league: anchorRankLeague, region },
    };
  }
  return {
    status_code: response.status_code,
    message: response.message,
  };
}
