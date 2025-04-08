import type {
  BroadcastOrganizationCreateMessage,
  CreateOrgRequest,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { ServerBroadcastMessageChannel } from '@tk-crawler/biz-shared';
import { mysqlClient, redisMessageBus } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError } from '../../../utils';
import { checkOrgNameExist } from './check-org-name-exist';

export async function createOrg(data: CreateOrgRequest): Promise<void> {
  logger.info('[Create Org]', { data });
  if (await checkOrgNameExist(data.name)) {
    throw new BusinessError('组织名称已存在');
  }
  const { areas, ...rest } = data;
  assert(areas && areas.length > 0, '地区不能为空');
  await mysqlClient.prismaClient.$transaction(async tx => {
    const org = await tx.organization.create({
      data: rest,
    });
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
      },
    };
    redisMessageBus.publish(
      ServerBroadcastMessageChannel.OrganizationMessage,
      JSON.stringify(message),
    );
  });
}
