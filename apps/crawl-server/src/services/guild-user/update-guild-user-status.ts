import type { TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';

export async function updateGuildUserStatus(data: {
  id: string;
  status: TKGuildUserStatus;
}) {
  const { id, status } = data;
  await mysqlClient.prismaClient.liveAdminUser.update({
    where: {
      id: BigInt(id),
    },
    data: { status },
  });
}
