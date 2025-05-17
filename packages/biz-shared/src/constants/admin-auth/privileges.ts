import { SystemAdminUserRole } from './roles';

export enum AdminPrivilege {
  // 爬虫管理
  CRAWLER_MANAGEMENT = 'crawler_management',
  // 系统管理
  SYSTEM_MANAGEMENT = 'system_management',
  // 用户管理
  CLIENT_MANAGEMENT = 'client_management',
  // 公会管理
  GUILD_MANAGEMENT = 'guild_management',
}

const ROLE_TO_PRIVILEGE_MAP: Record<
  SystemAdminUserRole,
  AdminPrivilege[] | 'all'
> = {
  [SystemAdminUserRole.ADMIN]: 'all',
  [SystemAdminUserRole.USER]: [
    AdminPrivilege.CRAWLER_MANAGEMENT,
    AdminPrivilege.GUILD_MANAGEMENT,
  ],
};

export function getAdminPrivilegesByRole(role: SystemAdminUserRole) {
  return ROLE_TO_PRIVILEGE_MAP[role];
}
