import type {
  GetOrgListRequest,
  GetOrgListResponse,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import {
  RESPONSE_CODE,
  // transObjectIdToBigInt,
  // transObjectIdToString,
} from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

export async function getOrgList(
  data: GetOrgListRequest,
): Promise<GetOrgListResponse> {
  logger.info('[Get Org List]', { data });
  const orgs = await mysqlClient.prismaClient.organization.findMany({
    where: data.filter,
    skip: (data.page_num - 1) * data.page_size,
    take: data.page_size,
    orderBy: data.order_by,
  });
  return {
    status_code: RESPONSE_CODE.SUCCESS,
    data: orgs.map(org => ({
      ...org,
      id: org.id.toString(),
    })),
    total_count: orgs.length,
  };
}
