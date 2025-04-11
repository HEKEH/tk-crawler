import type { BatchCheckAnchorResponse } from './types';
import {
  COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
  getInformalMessageToken,
  TIKTOK_LIVE_ADMIN_URL,
} from '@tk-crawler/biz-shared';
import { getUrl } from '@tk-crawler/shared';
import { getXBogus } from '@tk-crawler/x-bogus';
import { commonPostRequest } from '../utils/common-request';

export interface BatchCheckAnchorParams {
  displayIds: string[];
  cookie: string;
  factionId: string;
}

/** 获取主播的签约状态 */
export async function batchCheckAnchor({
  displayIds,
  cookie,
  factionId,
}: BatchCheckAnchorParams) {
  const body = JSON.stringify({
    DisplayIDList: displayIds,
  });
  const headers = {
    ...COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
    'faction-id': factionId,
    cookie,
  };
  const url = getUrl({
    baseUrl: TIKTOK_LIVE_ADMIN_URL,
    path: '/creators/live/union_platform_api/agency/union_invite/batch_check_anchor/',
    params: {
      msToken: getInformalMessageToken(),
    },
  });
  const xBogus = getXBogus(url, body);
  return commonPostRequest<BatchCheckAnchorResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers,
    body,
    transformBodyToString: true,
  });
}
