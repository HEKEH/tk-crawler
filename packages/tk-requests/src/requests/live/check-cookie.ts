import type { TikTokQueryTokens } from './types';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '../../get-x-bogus';
import { commonGetRequest } from '../utils/common-request';
import { getTiktokCookie } from '../utils/cookie';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  getTiktokRegionParams,
  TIKTOK_URL,
} from './constants';

export async function checkTiktokCookieValid({
  tokens,
}: {
  tokens: TikTokQueryTokens;
}) {
  const cookie = getTiktokCookie();
  if (!cookie) {
    return false;
  }
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams('all');
  const url = getUrl({
    baseUrl: TIKTOK_URL,
    path: '/passport/web/account/info/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      user_is_login: 'true',
      ...regionParams,
      ...tokens,
    },
  });
  const xBogus = getXBogus(url);
  const response = await commonGetRequest<{
    message: string;
  }>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
      ...regionHeaders,
      cookie: getTiktokCookie(),
    },
    shouldCheckResponse: false,
    shouldUpdateMsToken: false,
  });
  return response.message === 'success';
}
