import type { AxiosRequestConfig } from 'axios';
import type { GetProfileResponse } from './types';
import {
  COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
  getInformalMessageToken,
  TIKTOK_LIVE_ADMIN_URL,
} from '@tk-crawler/biz-shared';
import { getUrl, type Logger } from '@tk-crawler/shared';
import axios from 'axios';
import { getXBogus } from '../../get-x-bogus';

export async function getProfile(
  data: {
    cookie: string;
    factionId: string;
  },
  logger: Logger,
) {
  const headers = {
    ...COMMON_TIKTOK_LIVE_ADMIN_HEADERS,
    Cookie: data.cookie,
    'faction-id': data.factionId,
  };
  let url = getUrl({
    baseUrl: TIKTOK_LIVE_ADMIN_URL,
    path: '/creators/live/union_platform_api/platform_account/get_profile/',
    params: {
      user_id: '',
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
    const res = await axios<GetProfileResponse>(config);
    const { data } = res;
    if (data && data.status_code === 0) {
      logger.debug('[response] success:', data);
    } else {
      logger.error('[response] business error:', data);
    }
    return data;
  } catch (error) {
    logger.error('[response] system error:', error);
    throw error;
  }
}
