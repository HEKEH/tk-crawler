import type { AdminUserRole } from '../constants';
import type {
  AdminPrivilege } from '../constants/admin-auth/privileges';
import {
  getAdminPrivilegesByRole,
} from '../constants/admin-auth/privileges';

export function hasAdminPrivilege(
  role: AdminUserRole,
  privilege: AdminPrivilege,
) {
  const privileges = getAdminPrivilegesByRole(role);
  if (privileges === 'all') {
    return true;
  }
  return privileges.includes(privilege);
}
