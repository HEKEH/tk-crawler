import type { TkAccount } from '@tk-crawler/biz-shared';
import type { TikTokQueryTokens } from './types';
import { TIKTOK_URL } from '@tk-crawler/biz-shared';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '../../get-x-bogus';
import { commonGetRequest } from '../utils/common-request';
import { getTiktokCookie } from '../utils/cookie';
import {
  COMMON_TIKTOK_HEADERS,
  getDynamicCommonTiktokQuery,
  getTiktokRegionParams,
} from './constants';

export async function checkTiktokCookieValid({
  tokens,
}: {
  tokens: TikTokQueryTokens;
}): Promise<{
  success: boolean;
  data?: TkAccount;
}> {
  const cookie = getTiktokCookie();
  if (!cookie) {
    return {
      success: false,
    };
  }
  const { headers: regionHeaders, params: regionParams } =
    getTiktokRegionParams('all');
  const url = getUrl({
    baseUrl: TIKTOK_URL,
    path: '/passport/web/account/info/',
    params: {
      ...getDynamicCommonTiktokQuery(),
      user_is_login: 'true',
      ...regionParams,
      ...tokens,
    },
  });
  const xBogus = getXBogus(url);
  const response = await commonGetRequest<{
    message: string;
    data: TkAccount;
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
  return {
    success: response.message === 'success',
    data: response.data,
  };
}
