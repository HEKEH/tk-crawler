export enum AdminUserRole {
  ADMIN = 1,
  USER = 5,
}

export const AdminUserRoleMap: Record<AdminUserRole, string> = {
  [AdminUserRole.ADMIN]: '管理员',
  [AdminUserRole.USER]: '用户',
};

const ALL_ADMIN_USER_ROLES = [AdminUserRole.ADMIN, AdminUserRole.USER];

export const ADMIN_USER_ROLE_OPTIONS = ALL_ADMIN_USER_ROLES.map(role => ({
  value: role,
  label: AdminUserRoleMap[role],
}));
