import type { BatchCheckAnchorResponse } from './types';
import { commonPostRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';
import { getMessageToken, getXBogusNewVersion } from '../utils/params';
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
      msToken: getMessageToken(),
    },
  });
  const xBogus = getXBogusNewVersion(url, body);
  return commonPostRequest<BatchCheckAnchorResponse>({
    url: `${url}&X-Bogus=${xBogus}`,
    headers,
    body,
  });
}
