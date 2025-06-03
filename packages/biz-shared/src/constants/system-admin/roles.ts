export enum SystemAdminUserRole {
  ADMIN = 1,
  USER = 5,
  DEALER = 6,
}

export const AdminUserRoleMap: Record<SystemAdminUserRole, string> = {
  [SystemAdminUserRole.ADMIN]: '管理员',
  [SystemAdminUserRole.USER]: '用户',
  [SystemAdminUserRole.DEALER]: '经销商',
};

const ALL_ADMIN_USER_ROLES = [
  SystemAdminUserRole.ADMIN,
  SystemAdminUserRole.USER,
  SystemAdminUserRole.DEALER,
];

export const ADMIN_USER_ROLE_OPTIONS = ALL_ADMIN_USER_ROLES.map(role => ({
  value: role,
  label: AdminUserRoleMap[role],
}));
