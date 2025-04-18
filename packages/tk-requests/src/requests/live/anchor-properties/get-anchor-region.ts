import type { AxiosRequestConfig } from 'axios';
import { TIKTOK_URL } from '@tk-crawler/biz-shared';
import axios from 'axios';
import { getLogger } from '../../../infra/logger';
import { extractRegionFromHtml } from '../../utils/extract-region';

/** @deprecated */
export async function getAnchorRegion({
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
        getLogger().error('Error getting user region:', error);
      }
    }
  }
  return null;
}
