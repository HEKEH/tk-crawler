import type {
  GetOrgMemberListRequest,
  GetOrgMemberListResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';

export async function getOrgMemberList(
  data: GetOrgMemberListRequest,
): Promise<GetOrgMemberListResponseData> {
  logger.info('[Get Org Member List]', { data });
  const orderBy = data.order_by ?? {};
  const [orgMembers, total] = await Promise.all([
    mysqlClient.prismaClient.orgUser.findMany({
      where: data.filter,
      skip: (data.page_num - 1) * data.page_size,
      take: data.page_size,
      orderBy,
      omit: {
        password: true,
      },
    }),
    mysqlClient.prismaClient.orgUser.count({
      where: data.filter,
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
