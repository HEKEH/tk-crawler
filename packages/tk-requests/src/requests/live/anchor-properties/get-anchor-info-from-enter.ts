import type { NumberString } from '@tk-crawler/shared';
import type { WithRegion } from '../../types';
import type { TikTokQueryTokens } from '../types';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '../../../get-x-bogus';
import { commonPostRequest } from '../../utils/common-request';
import { getTiktokCookie } from '../../utils/cookie';
import {
  COMMON_TIKTOK_HEADERS,
  getDynamicCommonTiktokQuery,
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

export interface GetAnchorInfoFromEnterResult {
  status_code: number;
  data?: {
    level?: number;
    user_count: number;
    follower_count: number;
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
}>): Promise<GetAnchorInfoFromEnterResult> {
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams(region);
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/room/enter/',
    params: {
      ...getDynamicCommonTiktokQuery(),
      ...regionParams,
      ...tokens,
      user_is_login: 'false',
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
    transformBodyToString: true,
    shouldUpdateMsToken: true,
  });
  if (response.status_code === 0 && response.data) {
    const { owner, user_count } = response.data;
    const { badge_list } = owner;
    const { level } = badge_list[0]?.privilege_log_extra || {};
    return {
      status_code: 0,
      data: {
        level: level ? Number(level) : undefined,
        user_count,
        follower_count: owner.follow_info.follower_count,
        // like_count,
      },
    };
  }
  return {
    status_code: response.status_code,
    message: response.message,
  };
}
