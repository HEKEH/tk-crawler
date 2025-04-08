import type { UpdateOrgMembershipRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import dayjs from 'dayjs';
import { logger } from '../../../infra/logger';
import { BusinessError } from '../../../utils';

export async function updateOrgMembership(
  data: UpdateOrgMembershipRequest,
): Promise<void> {
  logger.info('[Update Org Membership]', { data });
  const { id, membership_days: days } = data;
  const org = await mysqlClient.prismaClient.organization.findUnique({
    where: {
      id: BigInt(id),
    },
  });
  if (!org) {
    throw new BusinessError('未找到该机构');
  }
  const membershipExpireAt = org.membership_expire_at;
  if (!membershipExpireAt) {
    await mysqlClient.prismaClient.organization.update({
      where: {
        id: BigInt(id),
      },
      data: {
        membership_start_at: new Date(),
        membership_expire_at: dayjs().add(days, 'day').toDate(),
      },
    });
    return;
  }
  if (dayjs(membershipExpireAt).isAfter(dayjs())) {
    await mysqlClient.prismaClient.organization.update({
      where: {
        id: BigInt(data.id),
      },
      data: {
        membership_expire_at: dayjs(membershipExpireAt)
          .add(days, 'day')
          .toDate(),
      },
    });
  } else {
    await mysqlClient.prismaClient.organization.update({
      where: {
        id: BigInt(data.id),
      },
      data: {
        membership_start_at: new Date(),
        membership_expire_at: dayjs().add(days, 'day').toDate(),
      },
    });
  }
}
