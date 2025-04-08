import type { DeleteOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError } from '../../../utils';

export async function deleteOrgMember(
  data: DeleteOrgMemberRequest,
): Promise<void> {
  logger.info('[Delete Org Member]', { data });
  const { org_id, id } = data;
  const orgUser = await mysqlClient.prismaClient.orgUser.findUnique({
    where: {
      id: BigInt(id),
    },
    select: {
      org_id: true,
    },
  });
  if (!orgUser) {
    throw new BusinessError('组织成员不存在');
  }
  if (orgUser.org_id.toString() !== org_id) {
    throw new BusinessError('组织成员不属于该组织');
  }
  await mysqlClient.prismaClient.orgUser.delete({
    where: {
      id: BigInt(id),
    },
  });
}
