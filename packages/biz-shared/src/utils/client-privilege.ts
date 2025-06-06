import type { ClientPrivilege } from '../constants';
import type { OrgMemberRole } from '../types';
import { getClientPrivilegesByRole } from '../constants';

export function hasClientPrivilege(
  role: OrgMemberRole,
  privilege: ClientPrivilege,
) {
  const privileges = getClientPrivilegesByRole(role);
  if (privileges === 'all') {
    return true;
  }
  return privileges.includes(privilege);
}
