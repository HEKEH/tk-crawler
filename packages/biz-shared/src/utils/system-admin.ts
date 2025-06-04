import type { AdminPrivilege } from '../constants/system-admin/privileges';
import dayjs from 'dayjs';
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
  followPrice: number;
  followDevices: number;
}

/** 计算收费金额 */
export function computeCharge({
  membershipDays,
  basePrice,
  followPrice,
  followDevices,
}: ComputeChargeParams) {
  return ((basePrice + followPrice * followDevices) * membershipDays) / 30;
}

export function computeChargeByDevicesChange({
  oldDevices,
  newDevices,
  followPrice,
  membershipExpireAt,
}: {
  oldDevices: number;
  newDevices: number;
  followPrice: number;
  membershipExpireAt: Date;
}) {
  if (oldDevices === newDevices) {
    return 0;
  }
  const days = Math.ceil(
    dayjs(membershipExpireAt).diff(dayjs(), 'seconds') / (24 * 60 * 60),
  );
  if (days <= 0) {
    return 0;
  }
  const charge = ((newDevices - oldDevices) * followPrice * days) / 30;
  return charge;
}

/** 是否应该收费，目前只需要收取经销商的费用 */
export function shouldCharge(user: { features: AdminFeature[] }) {
  return user.features.includes(AdminFeature.NEED_TO_CHARGE);
}
