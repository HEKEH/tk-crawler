import type { Area } from './area';
import type { OrganizationItem } from './org-and-user';

export interface TKGuildUser {
  id: string;
  username: string;
  password: string;
  org_id: string;
  status: TKGuildUserStatus;
  max_query_per_hour: number;
  max_query_per_day: number;
  current_query_per_hour?: number;
  current_query_per_day?: number;
  cookie: string | null;
  // is_cookie_valid: boolean | null;
  created_at: Date | string;
  updated_at: Date | string;
  started_at: Date | string | null;
  error_at: Date | string | null;
  organization?: OrganizationItem;
  area: Area | null;
  faction_id: number | null;
}

export enum TKGuildUserStatus {
  /** 未激活 */
  INACTIVE = 0,
  /** 等待查询 */
  WAITING = 1,
  /** 正常 */
  RUNNING = 2,
  /** 已停止 */
  STOPPED = 3,
  /** 有警告 */
  WARNING = 4,
  /** 已出错 */
  ERROR = 5,
  /** 已过期 */
  COOKIE_EXPIRED = 6,
}
