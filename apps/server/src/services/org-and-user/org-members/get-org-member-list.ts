import type {
  GetOrgMemberListFilter,
  GetOrgMemberListRequest,
  GetOrgMemberListResponseData,
  OrgUserWhereInput,
} from '@tk-crawler/biz-shared';
import type { Prisma } from '@tk-crawler/database';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { isEmpty } from '@tk-crawler/shared';
import { logger } from '../../../infra/logger';

export function transformOrgMemberListValues(
  filterValues: GetOrgMemberListFilter = {},
  orgId: string,
): OrgUserWhereInput {
  const { username, display_name, role_id, status, email, mobile } =
    filterValues;
  const where: OrgUserWhereInput = {
    role_id: role_id !== undefined ? role_id : undefined,
    status: status !== undefined ? status : undefined,
    email: email !== undefined ? email : undefined,
    mobile: mobile !== undefined ? mobile : undefined,
    org_id: BigInt(orgId),
    username: username ? { contains: username } : undefined,
    display_name: display_name ? { contains: display_name } : undefined,
  };
  return where;
}

export async function getOrgMemberList(
  data: GetOrgMemberListRequest,
): Promise<GetOrgMemberListResponseData> {
  logger.info('[Get Org Member List]', { data });
  const { org_id } = data;
  assert(org_id, 'org_id不能为空');
  const orderBy = isEmpty(data.order_by)
    ? [
        {
          role_id: 'asc' as const, // 默认按角色id排序，管理员优先
        },
        {
          id: 'asc' as const,
        },
      ]
    : data.order_by!;
  const where: Prisma.OrgUserWhereInput = transformOrgMemberListValues(
    data.filter,
    org_id,
  );
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
