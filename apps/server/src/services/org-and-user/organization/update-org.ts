import type {
  BroadcastOrganizationUpdateMessage,
  SystemAdminUserInfo,
  UpdateOrgRequest,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import {
  AdminFeature,
  ServerBroadcastMessageChannel,
} from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { omit } from 'lodash';
import { BusinessError } from '../../../utils';

export async function updateOrg(
  _data: UpdateOrgRequest,
  user_info: Pick<SystemAdminUserInfo, 'id' | 'features'>,
  logger: Logger,
): Promise<void> {
  const data = {
    ..._data,
    name: _data.name?.trim(),
  };
  delete (data as any).mobile_device_limit; // 即使存在，也不允许修改
  delete (data as any).membership_days; // 即使存在，也不允许修改
  logger.info('[Update Org]', { data });
  if (data.name) {
    const orgNameFind = await mysqlClient.prismaClient.organization.findFirst({
      select: { id: true },
      where: { name: data.name, id: { not: BigInt(data.id) } },
    });
    if (orgNameFind) {
      throw new BusinessError('组织名称已存在');
    }
  }
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
  const { areas, ...rest } = data;
  await mysqlClient.prismaClient.$transaction(async tx => {
    await tx.organization.update({
      where: {
        id: BigInt(rest.id),
      },
      data: omit(rest, ['id']),
    });
    if (areas && areas.length > 0) {
      await tx.orgAreaRelation.deleteMany({
        where: {
          org_id: BigInt(rest.id),
        },
      });
      await tx.orgAreaRelation.createMany({
        data: areas.map(area => ({
          org_id: BigInt(rest.id),
          area,
        })),
      });
    }
    const message: BroadcastOrganizationUpdateMessage = {
      type: 'update',
      data: {
        id: rest.id,
        name: data.name,
        status: data.status,
        ignore_commerce_anchor: data.ignore_commerce_anchor,
        areas,
      },
    };
    redisMessageBus.publish(
      ServerBroadcastMessageChannel.OrganizationMessage,
      message,
    );
  });
}
