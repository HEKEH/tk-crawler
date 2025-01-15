import type { Region } from './region';

export interface LiveAnchorCrawlerSettings {
  region: Region[] | 'all';
  fansLimit?: [number | undefined, number | undefined];
  /** 数据过期时间，单位：天。如果超过这个时间，则重新验证 */
  outdatedDays: number;
  /** 每小时查询次数限制 */
  queryLimitOneHour: number;
  /** 每天查询次数限制 */
  queryLimitOneDay: number;
}
