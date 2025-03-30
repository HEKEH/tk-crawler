import type { OrganizationItem } from './org-and-user';
import type { Region } from './region';

export interface TKGuildUser {
  id: string;
  username: string;
  password: string;
  org_id: string;
  status: TKGuildUserStatus;
  max_query_per_hour: number | null;
  max_query_per_day: number | null;
  cookie: string | null;
  // is_cookie_valid: boolean | null;
  created_at: Date;
  updated_at: Date;
  organization?: OrganizationItem;
  regions: Region[];
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
}
