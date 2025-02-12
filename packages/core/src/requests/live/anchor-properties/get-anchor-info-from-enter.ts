import type { NumberString } from '@tk-crawler/shared';
import type { WithRegion } from '../../../types';
import type { TikTokQueryTokens } from '../types';
import { commonPostRequest } from '../../utils/common-request';
import { getTiktokCookie } from '../../utils/cookie';
import { getUrl } from '../../utils/get-url';
import { getXBogus } from '../../utils/params';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_WEBCAST_URL,
} from '../constants';

export interface LiveEnterResponse {
  status_code: number;
  extra?: {
    now: number;
  };
  data?: {
    /** 直播间人数 */
    user_count: number;
    /** 直播间点赞数 */
    like_count: number;
    owner: {
      follow_info: {
        follower_count: number;
      };
      badge_list: [
        {
          privilege_log_extra: {
            level: NumberString;
          };
        },
      ];
    };
  };
  message?: string;
}

export async function getAnchorInfoFromEnter({
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
    path: '/webcast/room/enter/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      ...regionParams,
      ...tokens,
      user_is_login: 'true',
    },
  });
  const body = `enter_source=recommend-suggested_others_photo&room_id=${roomId}`;
  const xBogus = getXBogus(url, body);
  const response = await commonPostRequest<LiveEnterResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
      cookie: getTiktokCookie(),
    },
    body,
  });
  if (response.status_code === 0 && response.data) {
    const { owner, user_count } = response.data;
    const { badge_list } = owner;
    const { privilege_log_extra } = badge_list[0];
    const { level } = privilege_log_extra;
    return {
      status_code: 0,
      data: {
        level: Number(level),
        user_count,
        follower_count: owner.follow_info.follower_count,
        // like_count,
      },
    };
  }
  return response;
}
