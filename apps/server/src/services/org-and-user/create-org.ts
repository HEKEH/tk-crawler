import type {
  CreateOrgRequest,
  CreateOrgResponse,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

export async function createOrg(
  data: CreateOrgRequest,
): Promise<CreateOrgResponse> {
  logger.info('[Create Org]', { data });
  await mysqlClient.prismaClient.organization.create({
    data,
  });
  return {
    status_code: RESPONSE_CODE.SUCCESS,
  };
}
