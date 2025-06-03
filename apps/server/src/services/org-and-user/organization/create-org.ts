import type {
  BroadcastOrganizationCreateMessage,
  CreateOrgRequest,
  SystemAdminUserInfo,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import assert from 'node:assert';
import {
  AdminFeature,
  computeCharge,
  ServerBroadcastMessageChannel,
  shouldCharge,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { BusinessError } from '../../../utils';
import { checkOrgNameExist } from './check-org-name-exist';

export async function createOrg(
  _data: CreateOrgRequest,
  user_info: Pick<
    SystemAdminUserInfo,
    'id' | 'features' | 'base_price' | 'follow_price' | 'balance'
  >,
  logger: Logger,
): Promise<void> {
  const data = {
    ..._data,
    name: _data.name?.trim(),
  };
  assert(data.name, '组织名称不能为空');
  assert(data.areas && data.areas.length > 0, '区域不能为空');
  logger.info('[Create Org]', { data });
  if (await checkOrgNameExist(data.name)) {
    throw new BusinessError('组织名称已存在');
  }
  const { areas, membership_days, ...rest } = data;
  assert(areas && areas.length > 0, '地区不能为空');
  await mysqlClient.prismaClient.$transaction(async tx => {
    let membership_start_at: Date | undefined;
    let membership_expire_at: Date | undefined;
    let membership_charge: number | undefined;
    if (shouldCharge(user_info) && membership_days) {
      const now = dayjs();
      membership_start_at = now.toDate();
      membership_expire_at = now.add(membership_days, 'day').toDate();
      membership_charge = computeCharge({
        membershipDays: membership_days,
        basePrice: user_info.base_price,
      });
      if (membership_charge > user_info.balance) {
        throw new BusinessError('余额不足');
      }
    }
    const [org, system_admin_user] = await Promise.all([
      tx.organization.create({
        data: {
          ...rest,
          membership_start_at,
          membership_expire_at,
          owner_id: user_info.features.includes(AdminFeature.ONLY_OWN_ORG)
            ? BigInt(user_info.id)
            : undefined,
        },
      }),
      membership_charge
        ? tx.systemAdminUser.update({
            where: { id: BigInt(user_info.id) },
            data: { balance: { decrement: membership_charge } },
          })
        : undefined,
    ]);
    if (system_admin_user && system_admin_user.balance.toNumber() < 0) {
      logger.error('[Create Org] Insufficient balance', {
        userId: user_info.id,
        balance: system_admin_user.balance.toNumber(),
        charge: membership_charge,
      });
      throw new BusinessError('余额不足');
    }
    await tx.orgAreaRelation.createMany({
      data: areas.map(area => ({
        org_id: org.id,
        area,
      })),
    });
    const message: BroadcastOrganizationCreateMessage = {
      type: 'create',
      data: {
        id: org.id.toString(),
        name: org.name,
        membership_start_at: org.membership_start_at,
        membership_expire_at: org.membership_expire_at,
        status: org.status,
        areas,
        ignore_commerce_anchor: org.ignore_commerce_anchor,
      },
    };
    redisMessageBus.publish(
      ServerBroadcastMessageChannel.OrganizationMessage,
      message,
    );
  });
}
