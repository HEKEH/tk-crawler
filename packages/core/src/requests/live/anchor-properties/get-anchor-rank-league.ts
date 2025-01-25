import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { commonGetRequest } from '../../utils/common-request';
import { getUrl } from '../../utils/get-url';
import { getXBogusOldVersion } from '../../utils/params';
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
    gifts_info: {
      gift_gallery_info: {
        anchor_ranking_league: string;
        gallery_ranking_league: string;
      };
    };
  };
  message?: string;
}

export async function getAnchorRankLeague({
  region,
  tokens,
  roomId,
}: WithRegion<{
  tokens: TikTokQueryTokens;
  roomId: string;
}>) {
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
  const xBogus = getXBogusOldVersion(url);
  const response = await commonGetRequest<LiveGiftListResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
    },
  });
  if (response.status_code === 0) {
    const anchorRankLeague =
      response.data?.gifts_info?.gift_gallery_info?.anchor_ranking_league;
    return {
      status_code: 0,
      data: anchorRankLeague,
    };
  }
  return response;
}
