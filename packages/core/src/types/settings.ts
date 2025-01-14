import type { Region } from './region';

export interface LiveAnchorCrawlerSetting {
  region: Region | 'all';
  fansLimitLow?: number;
  fansLimitHigh?: number;
  /** 数据过期时间，单位：天。如果超过这个时间，则重新验证 */
  outdatedDays: number;
  /** 每小时查询次数限制 */
  queryLimitOneHour: number;
  /** 每天查询次数限制 */
  queryLimitOneDay: number;
}
