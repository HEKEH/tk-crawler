import type { AxiosRequestConfig } from 'axios';
import type { StartupResponse } from './types';
import {
  COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
  getInformalMessageToken,
  TIKTOK_LIVE_ADMIN_URL,
} from '@tk-crawler/biz-shared';
import { getUrl, type Logger } from '@tk-crawler/shared';
import axios from 'axios';
import { getXBogus } from '../../get-x-bogus';

export async function startup(cookie: string, logger: Logger) {
  const headers = {
    ...COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
    Cookie: cookie,
  };
  let url = getUrl({
    baseUrl: TIKTOK_LIVE_ADMIN_URL,
    path: '/creators/live/union_platform_api/agency/common/startup/',
    params: {
      requestFrom: 'portal',
      msToken: getInformalMessageToken(),
    },
  });
  const xBogus = getXBogus(url);
  url = `${url}&X-Bogus=${xBogus}`;

  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url,
      headers,
    };
    logger.debug('[request] config:', config);
    const res = await axios<StartupResponse>(config);
    const { data } = res;
    if (data && data.BaseResp.StatusCode === 0) {
      logger.debug('[response] success:', data);
    } else {
      logger.error('[response] startup business error:', data);
    }
    return data;
  } catch (error) {
    logger.error('[response] startup system error:', error);
    throw error;
  }
}
