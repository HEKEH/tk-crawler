import type { AssignTaskRequest } from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';
import { BusinessError } from '../../utils';
// import { clearAnchorListCache } from '../anchor/get-anchor-list';

export async function assignTask(
  data: AssignTaskRequest & {
    org_id: string;
  },
  shouldCheckGuildUser = true,
): Promise<void> {
  logger.info('[Task Assign]', { data });
  const { anchor_check_ids, org_member_id, org_id } = data;
  assert(anchor_check_ids && anchor_check_ids.length > 0, '列表不能为空');
  assert(org_member_id !== undefined, '缺少用户参数');
  assert(org_id, '机构不能为空');
  const orgId = BigInt(org_id);
  const anchorCheckIds = anchor_check_ids.map(id => BigInt(id));
  const anchorNotInOrg =
    await mysqlClient.prismaClient.anchorInviteCheck.findFirst({
      where: {
        id: {
          in: anchorCheckIds,
        },
        org_id: {
          not: orgId,
        },
      },
    });
  if (anchorNotInOrg) {
    throw new BusinessError('异常请求，试图操作不属于机构的数据');
  }
  const orgMemberId = org_member_id ? BigInt(org_member_id) : null;
  if (shouldCheckGuildUser && orgMemberId) {
    const guildUser = await mysqlClient.prismaClient.orgUser.findUnique({
      where: {
        id: orgMemberId,
        org_id: orgId,
      },
    });
    if (!guildUser) {
      throw new BusinessError('任务分配的用户不存在');
    }
  }
  await mysqlClient.prismaClient.anchorInviteCheck.updateMany({
    where: {
      org_id: orgId,
      id: {
        in: anchorCheckIds,
      },
    },
    data: {
      assign_to: orgMemberId,
    },
  });

  // 清除缓存
  // await clearAnchorListCache(org_id);
}
