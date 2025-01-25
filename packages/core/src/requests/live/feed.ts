import type { FeedResponse, WithRegion } from '../../types';
import type { TikTokQueryTokens } from './types';
import { commonGetRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';
import { type ChannelParams, getXBogus } from '../utils/params';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from './constants';

export async function getFeed({
  region,
  tokens,
  channelParams,
}: WithRegion<{ tokens: TikTokQueryTokens; channelParams: ChannelParams }>) {
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams(region);
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/feed/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      ...regionParams,
      ...channelParams,
      ...tokens,
    },
  });
  const xBogus = getXBogus(url);
  return commonGetRequest<FeedResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
    },
  });
}
