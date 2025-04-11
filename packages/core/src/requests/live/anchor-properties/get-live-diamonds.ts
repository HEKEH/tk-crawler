import type { NumberString } from '@tk-crawler/shared';
import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '@tk-crawler/tk-requests';
import { commonGetRequest } from '../../utils/common-request';
import { getTiktokCookie } from '../../utils/cookie';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from '../constants';

interface FanRank {
  rank: NumberString;
  score: NumberString;
}

export interface OnlineAudienceResponse {
  status_code: number;
  extra?: {
    now: number;
  };
  data?: {
    ranks: FanRank[];
  };
  message?: string;
}

export interface GetLiveDiamondsResult {
  status_code: number;
  data?: {
    diamonds: number;
  };
  message?: string;
}

export async function getLiveDiamonds({
  region,
  tokens,
  anchorId,
  roomId,
}: WithRegion<{
  tokens: TikTokQueryTokens;
  anchorId: string;
  roomId: string;
}>) {
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams(region);
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/ranklist/online_audience/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      user_is_login: 'true',
      ...regionParams,
      anchor_id: anchorId,
      room_id: roomId,
      ...tokens,
    },
  });
  const xBogus = getXBogus(url);
  const response = await commonGetRequest<OnlineAudienceResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
      cookie: getTiktokCookie(),
    },
  });
  if (response.status_code === 0) {
    const ranks = response.data?.ranks || [];
    const diamonds = ranks.reduce((acc, rank) => {
      acc += Number(rank.score || 0);
      return acc;
    }, 0);
    return {
      status_code: 0,
      data: { diamonds },
    };
  }
  return {
    status_code: response.status_code,
    message: response.message,
  };
}
