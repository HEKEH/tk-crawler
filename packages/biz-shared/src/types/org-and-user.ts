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
  /** 会员是否有效 */
  if_membership_valid: boolean;
  /** 状态 */
  status: OrganizationStatus;
  /** 备注 */
  remark: string | null;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
  /** 用户数量 */
  user_count: number;
}

export enum OrgMemberStatus {
  /** 正常 */
  normal = 1,
  /** 禁用 */
  disabled = 0,
}

export enum OrgMemberRole {
  /** 管理员 */
  admin = 1,
  /** 成员 */
  member = 2,
}

export interface OrgMemberItem {
  id: string;
  /** 所属机构id */
  org_id: string;
  /** 登录名，唯一 */
  username: string;
  /** 显示名 */
  display_name: string;
  /** 密码 */
  password: string;
  /** 邮箱 */
  email?: string | null;
  /** 手机号 */
  mobile?: string | null;
  /** 角色id */
  role_id: OrgMemberRole;
  /** 状态 */
  status: OrgMemberStatus;
  /** 创建时间 */
  created_at?: Date | string;
  /** 更新时间 */
  updated_at?: Date | string;
}
