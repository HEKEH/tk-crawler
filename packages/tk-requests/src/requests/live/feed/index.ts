import type { WithRegion } from '../../types';
import type { ChannelParams } from '../../utils/params';
import type { TikTokQueryTokens } from '../types';
import type { FeedResponse } from './types';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '../../../get-x-bogus';
import { commonGetRequest } from '../../utils/common-request';
import {
  COMMON_TIKTOK_HEADERS,
  getDynamicCommonTiktokQuery,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from '../constants';

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
      ...getDynamicCommonTiktokQuery(),
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
    shouldUpdateMsToken: false,
  });
}
