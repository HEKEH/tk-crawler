import type {
  BroadcastOrganizationUpdateMessage,
  UpdateOrgAnchorSearchPoliciesRequest,
} from '@tk-crawler/biz-shared';
import { ServerBroadcastMessageChannel } from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';

export async function updateOrgAnchorSearchPolicies(
  data: UpdateOrgAnchorSearchPoliciesRequest & { org_id: string },
): Promise<void> {
  logger.info('[Update Org Anchor Search Policies]', data);
  await mysqlClient.prismaClient.organization.update({
    where: {
      id: BigInt(data.org_id),
    },
    data: {
      ignore_commerce_anchor: data.ignore_commerce_anchor,
    },
  });
  const message: BroadcastOrganizationUpdateMessage = {
    type: 'update',
    data: {
      id: data.org_id,
      ignore_commerce_anchor: data.ignore_commerce_anchor,
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.OrganizationMessage,
    message,
  );
}
