import type {
  BroadcastOrganizationUpdateMessage,
  UpdateOrgAnchorSearchPoliciesRequest,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { ServerBroadcastMessageChannel } from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';

export async function updateOrgAnchorSearchPolicies(
  data: UpdateOrgAnchorSearchPoliciesRequest & { org_id: string },
  logger: Logger,
): Promise<void> {
  logger.info('[Update Org Anchor Search Policies]', data);
  await mysqlClient.prismaClient.organization.update({
    where: {
      id: BigInt(data.org_id),
    },
    data: {
      ignore_commerce_anchor: data.ignore_commerce_anchor,
      highest_diamonds_limit: data.highest_diamonds_limit,
      rank_league_limit: data.rank_league_limit,
    },
  });
  const message: BroadcastOrganizationUpdateMessage = {
    type: 'update',
    data: {
      id: data.org_id,
      ignore_commerce_anchor: data.ignore_commerce_anchor,
      highest_diamonds_limit: data.highest_diamonds_limit,
      rank_league_limit: data.rank_league_limit,
    },
  };
  redisMessageBus.publish(
    ServerBroadcastMessageChannel.OrganizationMessage,
    message,
  );
}
