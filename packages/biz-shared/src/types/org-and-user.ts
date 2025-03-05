export enum OrganizationStatus {
  /** 正常 */
  normal = 1,
  /** 禁用 */
  disabled = 0,
}

export interface OrganizationItem {
  /** 机构id */
  id: string;
  /** 机构名称 */
  name: string;
  /** 会员开始时间 */
  membership_start_at: Date | null;
  /** 会员到期时间 */
  membership_expire_at: Date | null;
  /** 状态 */
  status: OrganizationStatus;
  /** 备注 */
  remark: string | null;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
  // /** 用户数量 */
  // user_count: number;
}
