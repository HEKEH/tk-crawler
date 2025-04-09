import {
  type BroadcastOrganizationDeleteMessage,
  type DeleteOrgRequest,
  ServerBroadcastMessageChannel,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';

export async function deleteOrg(data: DeleteOrgRequest): Promise<void> {
  logger.info('[Delete Org]', { data });
  await mysqlClient.prismaClient.organization.delete({
    where: {
      id: BigInt(data.id),
    },
  });
  const message: BroadcastOrganizationDeleteMessage = {
    type: 'delete',
    data: {
      id: data.id,
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.OrganizationMessage,
    message,
  );
}
