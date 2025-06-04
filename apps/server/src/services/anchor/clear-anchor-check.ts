import type {
  ClearAnchorCheckRequest,
  ClearAnchorCheckResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
// import { clearAnchorListCache } from './get-anchor-list';
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
  // await clearAnchorListCache(org_id);
  return {
    deleted_count: count,
  };
}
