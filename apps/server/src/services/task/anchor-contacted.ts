import type { AnchorContactedRequest } from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../infra/logger';
// import { clearAnchorListCache } from '../anchor/get-anchor-list';
import { validateAnchorCheckIds } from './utils';

export async function anchorContacted(
  data: AnchorContactedRequest & {
    org_id: string;
    org_member_id: string | null;
  },
): Promise<void> {
  logger.info('[Anchor Contacted]', { data });
  const { ids: anchor_check_ids, org_member_id, org_id } = data;
  assert(anchor_check_ids && anchor_check_ids.length > 0, '列表不能为空');
  assert(org_member_id !== undefined, '缺少用户参数');
  assert(org_id, '机构不能为空');
  const orgId = BigInt(org_id);
  const anchorCheckIds = [...new Set(anchor_check_ids)].map(id => BigInt(id));
  await validateAnchorCheckIds(anchorCheckIds, orgId);
  const orgMemberId = org_member_id ? BigInt(org_member_id) : null;
  await mysqlClient.prismaClient.anchorInviteCheck.updateMany({
    where: {
      org_id: orgId,
      id: {
        in: anchorCheckIds,
      },
    },
    data: {
      contacted_by: orgMemberId,
    },
  });

  // 清除缓存
  // await clearAnchorListCache(org_id);
}
