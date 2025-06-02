import type {
  BroadcastOrganizationDeleteMessage,
  DeleteOrgRequest,
  SystemAdminUserInfo,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import {
  AdminFeature,
  ServerBroadcastMessageChannel,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { BusinessError } from '../../../utils';

export async function deleteOrg(
  data: DeleteOrgRequest,
  user_info: Pick<SystemAdminUserInfo, 'id' | 'features'>,
  logger: Logger,
): Promise<void> {
  logger.info('[Delete Org]', { data });
  if (user_info.features.includes(AdminFeature.ONLY_OWN_ORG)) {
    const org = await mysqlClient.prismaClient.organization.findUnique({
      where: {
        id: BigInt(data.id),
      },
      select: {
        owner_id: true,
      },
    });
    if (!org) {
      throw new BusinessError('机构不存在');
    }
    if (org.owner_id !== BigInt(user_info.id)) {
      throw new BusinessError('您没有权限操作该机构');
    }
  }
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
