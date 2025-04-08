import {
  type BroadcastOrganizationUpdateMessage,
  ServerBroadcastMessageChannel,
  type UpdateOrgMembershipRequest,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
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
  let updateData: {
    membership_start_at?: Date;
    membership_expire_at?: Date;
  };
  if (!membershipExpireAt) {
    updateData = {
      membership_start_at: new Date(),
      membership_expire_at: dayjs().add(days, 'day').toDate(),
    };
  } else if (dayjs(membershipExpireAt).isAfter(dayjs())) {
    updateData = {
      membership_expire_at: dayjs(membershipExpireAt).add(days, 'day').toDate(),
    };
  } else {
    updateData = {
      membership_start_at: new Date(),
      membership_expire_at: dayjs().add(days, 'day').toDate(),
    };
  }
  await mysqlClient.prismaClient.organization.update({
    where: {
      id: BigInt(id),
    },
    data: updateData,
  });
  const message: BroadcastOrganizationUpdateMessage = {
    type: 'update',
    data: {
      id,
      ...updateData,
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.OrganizationMessage,
    JSON.stringify(message),
  );
}
