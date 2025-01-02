import type { BatchCheckAnchorResponse } from './types';
import { commonPostRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';
import { getXBogus } from '../utils/params';
import {
  COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
  TIKTOK_LIVE_ADMIN_URL,
} from './constants';

export interface BatchCheckAnchorParams {
  displayIds: string[];
  cookie: string;
}

/** 获取主播的签约状态 */
export function batchCheckAnchor({
  displayIds,
  cookie,
}: BatchCheckAnchorParams) {
  const body = JSON.stringify({
    DisplayIDList: displayIds,
  });
  const headers = {
    ...COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
    cookie,
  };
  const url = getUrl({
    baseUrl: TIKTOK_LIVE_ADMIN_URL,
    path: '/creators/live/union_platform_api/agency/union_invite/batch_check_anchor/',
    params: {
      // msToken: getMessageToken(),
      msToken:
        '3OMaGWbDznBasjXWmySfzj9J24gBpihhlM_tZsZ3cTrKi8m6CRwvfBKOGlrReAe6GQsOxA8PWy2SGSODJc7irUI8zdpp-ojPJI2tQ84-r6uBRy9XVj6AYVKGlTm7GjV_KJkGrUGh',
    },
  });
  const xBogus = getXBogus(url);
  // const xBogus = 'DFSzswjLD3Ko4BVWt8BVJELNKBPZ';
  return commonPostRequest<BatchCheckAnchorResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers,
    body,
  });
}
