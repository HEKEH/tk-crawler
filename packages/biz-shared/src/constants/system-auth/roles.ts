export enum SystemUserRole {
  ADMIN = 1,
  USER = 5,
}

export const SystemUserRoleMap: Record<SystemUserRole, string> = {
  [SystemUserRole.ADMIN]: '管理员',
  [SystemUserRole.USER]: '用户',
};

const ALL_SYSTEM_USER_ROLES = [SystemUserRole.ADMIN, SystemUserRole.USER];

export const SYSTEM_USER_ROLE_OPTIONS = ALL_SYSTEM_USER_ROLES.map(role => ({
  value: role,
  label: SystemUserRoleMap[role],
}));
