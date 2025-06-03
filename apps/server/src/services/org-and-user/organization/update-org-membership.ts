import type {
  BroadcastOrganizationUpdateMessage,
  SystemAdminUserInfo,
  UpdateOrgMembershipRequest,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import {
  AdminFeature,
  computeCharge,
  ServerBroadcastMessageChannel,
  shouldCharge,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { BusinessError } from '../../../utils';

interface OrganizationRow {
  id: bigint;
  owner_id: bigint | null;
  membership_expire_at: Date | null;
  mobile_device_limit: bigint;
}

export async function updateOrgMembership(
  data: UpdateOrgMembershipRequest,
  user_info: Pick<
    SystemAdminUserInfo,
    'id' | 'features' | 'base_price' | 'follow_price' | 'balance'
  >,
  logger: Logger,
): Promise<void> {
  logger.info('[Update Org Membership]', { data });
  const { id, membership_days: days } = data;
  let updateData: {
    membership_start_at?: Date;
    membership_expire_at?: Date;
  } = {};

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
      if (shouldCharge(user_info) && days) {
        const membership_charge = computeCharge({
          membershipDays: days,
          basePrice: user_info.base_price,
          followPrice: user_info.follow_price,
          followDevices: Number(org.mobile_device_limit),
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
    const updateOrgMembership = async () => {
      const membershipExpireAt = org.membership_expire_at;
      if (days > 0) {
        if (!membershipExpireAt) {
          updateData = {
            membership_start_at: new Date(),
            membership_expire_at: dayjs().add(days, 'day').toDate(),
          };
        } else if (dayjs(membershipExpireAt).isAfter(dayjs())) {
          updateData = {
            membership_expire_at: dayjs(membershipExpireAt)
              .add(days, 'day')
              .toDate(),
          };
        } else {
          updateData = {
            membership_start_at: new Date(),
            membership_expire_at: dayjs().add(days, 'day').toDate(),
          };
        }
      } else {
        // days为负数
        if (!membershipExpireAt) {
          throw new BusinessError('该机构没有会员');
        }
        const now = dayjs();
        if (dayjs(membershipExpireAt).isBefore(now)) {
          throw new BusinessError('该机构会员已过期');
        }
        const newExpireAt = dayjs(membershipExpireAt).add(days, 'day');
        if (newExpireAt.isBefore(now)) {
          throw new BusinessError('该机构会员天数不足');
        }
        updateData = {
          membership_expire_at: newExpireAt.toDate(),
        };
      }
      await tx.organization.update({
        where: {
          id: BigInt(id),
        },
        data: updateData,
      });
    };
    await Promise.all([updateBalance(), updateOrgMembership()]);
  });

  // Broadcast the update after transaction is committed
  const message: BroadcastOrganizationUpdateMessage = {
    type: 'update',
    data: {
      id,
      ...updateData,
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.OrganizationMessage,
    message,
  );
}
