import type { AdminPrivilege } from '../constants/system-admin/privileges';
import { AdminFeature, type SystemAdminUserRole } from '../constants';
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
  basePrice: number;
}

/** 计算收费金额 */
export function computeCharge({
  membershipDays,
  basePrice,
}: ComputeChargeParams) {
  return (basePrice * membershipDays) / 30;
}

/** 是否应该收费，目前只需要收取经销商的费用 */
export function shouldCharge(user: { features: AdminFeature[] }) {
  return user.features.includes(AdminFeature.NEED_TO_CHARGE);
}
