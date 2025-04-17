import type {
  ClearAnchorCheckRequest,
  ClearAnchorCheckResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { transformAnchorListFilterValues } from './get-anchor-list/filter';

export async function clearAnchorCheck({
  org_id,
  filter,
}: ClearAnchorCheckRequest & {
  org_id: string;
}): Promise<ClearAnchorCheckResponseData> {
  const where = transformAnchorListFilterValues(filter, org_id);
  const { count } = await mysqlClient.prismaClient.anchorInviteCheck.deleteMany(
    {
      where,
    },
  );
  return {
    deleted_count: count,
  };
}
