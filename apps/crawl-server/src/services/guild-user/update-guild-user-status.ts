import assert from 'node:assert';
import { TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import config from '../../config';

export async function updateGuildUserStatus(data: {
  id: string;
  status: TKGuildUserStatus;
}): Promise<TKGuildUserStatus> {
  const { id, status } = data;
  if (status === TKGuildUserStatus.WARNING) {
    return mysqlClient.prismaClient.$transaction(async tx => {
      const user = await tx.liveAdminUser.findUnique({
        where: {
          id: BigInt(id),
        },
        select: {
          status: true,
          warning_count: true,
        },
      });

      assert(user, `user not found: ${id}`);

      if (user.warning_count >= config.guildUserWarningLimit) {
        await tx.liveAdminUser.update({
          where: {
            id: BigInt(id),
          },
          data: { status: TKGuildUserStatus.ERROR, warning_count: 0 },
        });
        return TKGuildUserStatus.ERROR;
      }

      await tx.liveAdminUser.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: TKGuildUserStatus.WARNING,
          warning_count:
            user.status === TKGuildUserStatus.WARNING
              ? {
                  increment: 1,
                }
              : 1,
        },
      });
      return TKGuildUserStatus.WARNING;
    });
  }
  await mysqlClient.prismaClient.liveAdminUser.update({
    where: {
      id: BigInt(id),
    },
    data: { status, warning_count: 0 },
  });
  return status;
}
