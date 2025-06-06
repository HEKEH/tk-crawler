import { OrgMemberRole } from '../types';

export enum ClientPrivilege {
  // 系统管理
  SYSTEM_MANAGEMENT = 'system_management',
  // 公会管理
  GUILD_MANAGEMENT = 'guild_management',
  // 自动关注设备管理
  ANCHOR_MANAGEMENT = 'anchor_management',
  // 自动建联管理
  AUTO_CONTACT_MANAGEMENT = 'auto_contact_management',
}

const ROLE_TO_PRIVILEGE_MAP: Record<OrgMemberRole, ClientPrivilege[] | 'all'> =
  {
    [OrgMemberRole.admin]: 'all',
    [OrgMemberRole.member]: [ClientPrivilege.ANCHOR_MANAGEMENT],
  };

export function getClientPrivilegesByRole(role: OrgMemberRole) {
  return ROLE_TO_PRIVILEGE_MAP[role];
}
