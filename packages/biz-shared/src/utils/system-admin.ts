import type { AdminPrivilege } from '../constants/system-admin/privileges';
import {
  MEMBERSHIP_CHARGE_PER_MONTH,
  type SystemAdminUserRole,
} from '../constants';
import { getAdminPrivilegesByRole } from '../constants/system-admin/privileges';

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

export interface ComputeChargeParams {
  membershipDays: number;
  discount: number;
}

/** 计算收费金额 */
export function computeCharge({
  membershipDays,
  discount,
}: ComputeChargeParams) {
  return ((MEMBERSHIP_CHARGE_PER_MONTH * membershipDays) / 30) * discount;
}
