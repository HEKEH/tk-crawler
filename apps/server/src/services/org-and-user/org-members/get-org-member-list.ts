import type {
  GetOrgMemberListRequest,
  GetOrgMemberListResponseData,
} from '@tk-crawler/biz-shared';
import type { Prisma } from '@tk-crawler/database';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty } from '@tk-crawler/shared';
import { logger } from '../../../infra/logger';

export async function getOrgMemberList(
  data: GetOrgMemberListRequest,
): Promise<GetOrgMemberListResponseData> {
  logger.info('[Get Org Member List]', { data });
  const { org_id } = data;
  assert(org_id, 'org_id不能为空');
  const orderBy = isEmpty(data.order_by)
    ? {
        updated_at: 'desc' as const, // 默认按更新时间倒序排序
      }
    : data.order_by!;
  const where: Prisma.OrgUserWhereInput = {
    org_id: BigInt(org_id),
    ...data.filter,
  };
  const [orgMembers, total] = await Promise.all([
    mysqlClient.prismaClient.orgUser.findMany({
      where,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      omit: {
        password: true,
      },
    }),
    mysqlClient.prismaClient.orgUser.count({
      where,
    }),
  ]);
  return {
    list: orgMembers.map(orgMember => ({
      ...orgMember,
      org_id: orgMember.org_id.toString(),
      id: orgMember.id.toString(),
    })),
    total,
  };
}
