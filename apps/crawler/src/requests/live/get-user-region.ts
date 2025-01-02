import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { logger } from '../../infra/logger';
import { extractRegionFromHtml } from '../utils/extract-region';
import { TIKTOK_URL } from './constants';

export async function getUserRegion({
  userDisplayId,
  retryTimes = 10,
}: {
  userDisplayId: string;
  /** 有概率是拿不到地区的，所以需要重试几次 */
  retryTimes?: number;
}) {
  const url = `${TIKTOK_URL}/@${userDisplayId}`;
  const config: AxiosRequestConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url,
  };
  let t = retryTimes;
  while (t--) {
    try {
      const res = await axios<string>(config);
      const region = extractRegionFromHtml(res.data);
      if (region) {
        return region;
      }
    } catch (error) {
      if (t === 0) {
        logger.error('Error getting user region:', error);
      }
    }
  }
  return null;
}
