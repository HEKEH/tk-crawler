import type { SystemAdminUserRole } from '../constants';
import type { AdminPrivilege } from '../constants/admin-auth/privileges';
import { getAdminPrivilegesByRole } from '../constants/admin-auth/privileges';

export function hasAdminPrivilege(
  role: SystemAdminUserRole,
  privilege: AdminPrivilege,
) {
  const privileges = getAdminPrivilegesByRole(role);
  if (privileges === 'all') {
    return true;
  }
  return privileges.includes(privilege);
}
