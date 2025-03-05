import type {
  DeleteOrgRequest,
  DeleteOrgResponse,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

export async function deleteOrg(
  data: DeleteOrgRequest,
): Promise<DeleteOrgResponse> {
  logger.info('[Delete Org]', { data });
  await mysqlClient.prismaClient.organization.delete({
    where: {
      id: BigInt(data.id),
    },
  });
  return {
    status_code: RESPONSE_CODE.SUCCESS,
  };
}
