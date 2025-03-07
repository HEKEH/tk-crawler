import type { DeleteOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';

export async function deleteOrgMember(
  data: DeleteOrgMemberRequest,
): Promise<void> {
  logger.info('[Delete Org Member]', { data });
  await mysqlClient.prismaClient.orgUser.delete({
    where: {
      id: BigInt(data.id),
    },
  });
}
