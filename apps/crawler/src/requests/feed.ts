import type { FeedResponse, WithLng } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';
import {
  COMMON_TIKTOK_HEADERS,
  COMMON_TIKTOK_QUERY,
  TIKTOK_LANGUAGE_MAP,
  TIKTOK_WEBCAST_URL,
} from './constants';
import { commonGetRequest } from './utils/common-request';
import { getUrl } from './utils/get-url';
import { getMessageToken, getVerifyFp, getXBogus } from './utils/params';

// eslint-disable-next-line ts/no-empty-object-type
export default async function getFeed({ lng = DEFAULT_LANGUAGE }: WithLng<{}>) {
  const url = getUrl({
    baseUrl: TIKTOK_WEBCAST_URL,
    path: '/webcast/feed/',
    params: {
      ...COMMON_TIKTOK_QUERY,
      ...TIKTOK_LANGUAGE_MAP[lng],
      verifyFp: getVerifyFp(),
      msToken: getMessageToken(),
    },
  });
  const xBogus = getXBogus(url);
  return commonGetRequest<FeedResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers: {
      ...COMMON_TIKTOK_HEADERS,
    },
  });
}
