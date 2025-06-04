import type {
  SystemAdminUserInfo,
  UpdateOrgAutoFollowDeviceLimitRequest,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import {
  AdminFeature,
  computeChargeByDevicesChange,
  shouldCharge,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { BusinessError } from '../../../utils';

interface OrganizationRow {
  id: bigint;
  owner_id: bigint | null;
  membership_expire_at: Date | null;
  mobile_device_limit: bigint;
}

export async function updateAutoFollowDeviceLimit(
  data: UpdateOrgAutoFollowDeviceLimitRequest,
  user_info: Pick<
    SystemAdminUserInfo,
    'id' | 'features' | 'follow_price' | 'balance'
  >,
  logger: Logger,
): Promise<void> {
  logger.info('[Update Org Membership]', { data });
  const { id, auto_follow_device_limit } = data;

  // Use transaction to ensure atomicity
  await mysqlClient.prismaClient.$transaction(async tx => {
    // Use SELECT FOR UPDATE to lock the row
    const orgs = await tx.$queryRaw<OrganizationRow[]>`
      SELECT id, owner_id, mobile_device_limit, membership_expire_at
      FROM Organization
      WHERE id = ${BigInt(id)}
      FOR UPDATE
    `;
    const org = orgs[0];
    if (!org) {
      throw new BusinessError('未找到该机构');
    }
    if (user_info.features.includes(AdminFeature.ONLY_OWN_ORG)) {
      if (org.owner_id !== BigInt(user_info.id)) {
        throw new BusinessError('您没有权限操作该机构');
      }
    }

    const updateBalance = async () => {
      if (shouldCharge(user_info) && org.membership_expire_at) {
        const membership_charge = computeChargeByDevicesChange({
          oldDevices: Number(org.mobile_device_limit),
          newDevices: auto_follow_device_limit,
          followPrice: user_info.follow_price,
          membershipExpireAt: org.membership_expire_at,
        });
        if (membership_charge > user_info.balance) {
          throw new BusinessError('余额不足');
        }
        if (!membership_charge) {
          return;
        }
        const system_admin_user = await tx.systemAdminUser.update({
          where: { id: BigInt(user_info.id) },
          data: { balance: { decrement: membership_charge } },
        });
        if (!system_admin_user) {
          throw new BusinessError('更新账户余额失败');
        }
        if (system_admin_user.balance.toNumber() < 0) {
          throw new BusinessError('余额不足');
        }
      }
    };
    const updateDeviceLimit = async () => {
      await tx.organization.update({
        where: {
          id: BigInt(id),
        },
        data: {
          mobile_device_limit: auto_follow_device_limit,
        },
      });
    };
    await Promise.all([updateBalance(), updateDeviceLimit()]);
  });
}
