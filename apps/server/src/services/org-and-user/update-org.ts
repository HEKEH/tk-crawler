import type {
  UpdateOrgRequest,
  UpdateOrgResponse,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { omit } from 'lodash';
import { logger } from '../../infra/logger';

export async function updateOrg(
  data: UpdateOrgRequest,
): Promise<UpdateOrgResponse> {
  logger.info('[Update Org]', { data });
  await mysqlClient.prismaClient.organization.update({
    where: {
      id: BigInt(data.id),
    },
    data: omit(data, ['id']),
  });
  return {
    status_code: RESPONSE_CODE.SUCCESS,
  };
}
