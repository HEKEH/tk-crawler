import type {
  Area,
  BroadcastGuildUserMessageData,

  TKGuildUserStatus } from '@tk-crawler/biz-shared';
import {
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';

export async function getAvailableGuildUser(data: {
  org_id: string;
  id: string;
}): Promise<{
  data: BroadcastGuildUserMessageData | null;
}> {
  const liveAdminUser = await mysqlClient.prismaClient.liveAdminUser.findUnique(
    {
      select: {
        id: true,
        username: true,
        status: true,
        max_query_per_hour: true,
        max_query_per_day: true,
        cookie: true,
        faction_id: true,
        area: true,
      },
      where: {
        id: BigInt(data.id),
        org_id: BigInt(data.org_id),
        status: {
          in: VALID_GUILD_USER_STATUS_LIST,
        },
      },
    },
  );
  if (!liveAdminUser) {
    return {
      data: null,
    };
  }
  return {
    data: {
      id: liveAdminUser.id.toString(),
      username: liveAdminUser.username,
      org_id: data.org_id,
      status: liveAdminUser.status as TKGuildUserStatus,
      max_query_per_hour: liveAdminUser.max_query_per_hour,
      max_query_per_day: liveAdminUser.max_query_per_day,
      cookie: liveAdminUser.cookie,
      faction_id: liveAdminUser.faction_id,
      area: liveAdminUser.area as Area,
    },
  };
}
