import type { ClearAnchorCheckRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';

export async function clearAnchorCheck({
  orgId,
}: ClearAnchorCheckRequest & { orgId: string }) {
  await mysqlClient.prismaClient.anchorInviteCheck.deleteMany({
    where: {
      org_id: BigInt(orgId),
    },
  });
}
