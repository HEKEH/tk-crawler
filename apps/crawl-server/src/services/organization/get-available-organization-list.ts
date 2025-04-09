import type {
  Area,
  BroadcastGuildUserMessageData,
  BroadcastOrganizationMessageData,
} from '@tk-crawler/biz-shared';
import { OrganizationStatus, TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';

export async function getAvailableOrganizationList(): Promise<{
  list: (BroadcastOrganizationMessageData & {
    guild_users: BroadcastGuildUserMessageData[];
  })[];
}> {
  const orgs = await mysqlClient.prismaClient.organization.findMany({
    where: {
      membership_expire_at: {
        gt: new Date(),
      },
      status: OrganizationStatus.normal,
    },
    select: {
      id: true,
      name: true,
      membership_start_at: true,
      membership_expire_at: true,
      status: true,
      areas: {
        select: {
          area: true,
        },
      },
      liveAdminUsers: {
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
          status: {
            in: [
              TKGuildUserStatus.WAITING,
              TKGuildUserStatus.RUNNING,
              TKGuildUserStatus.WARNING,
            ],
          },
        },
      },
    },
  });
  return {
    list: orgs.map(({ areas, liveAdminUsers, ...org }) => {
      const orgId = org.id.toString();
      return {
        id: orgId,
        name: org.name,
        membership_start_at: org.membership_start_at,
        membership_expire_at: org.membership_expire_at,
        status: org.status as OrganizationStatus,
        areas: areas.map(item => item.area as Area),
        guild_users: liveAdminUsers.map(item => ({
          id: item.id.toString(),
          username: item.username,
          org_id: orgId,
          status: item.status as TKGuildUserStatus,
          max_query_per_hour: item.max_query_per_hour,
          max_query_per_day: item.max_query_per_day,
          cookie: item.cookie,
          faction_id: item.faction_id,
          area: item.area as Area,
        })),
      };
    }),
  };
}
