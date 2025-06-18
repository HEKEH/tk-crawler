import type {
  AnchorRankLeague,
  Area,
  BroadcastGuildUserMessageData,
  BroadcastOrganizationMessageData,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';
import {
  OrganizationStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';

export async function getAvailableOrganization(
  organizationId: string,
): Promise<{
  data:
    | (BroadcastOrganizationMessageData & {
        guild_users: BroadcastGuildUserMessageData[];
      })
    | null;
}> {
  const org = await mysqlClient.prismaClient.organization.findUnique({
    where: {
      id: BigInt(organizationId),
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
      ignore_commerce_anchor: true,
      highest_diamonds_limit: true,
      rank_league_limit: true,
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
            in: VALID_GUILD_USER_STATUS_LIST,
          },
          area: {
            not: null,
          },
        },
      },
    },
  });
  if (!org) {
    return {
      data: null,
    };
  }
  const { areas, liveAdminUsers } = org;
  const orgId = org.id.toString();
  return {
    data: {
      id: orgId,
      name: org.name,
      membership_start_at: org.membership_start_at,
      membership_expire_at: org.membership_expire_at,
      status: org.status as OrganizationStatus,
      areas: areas.map(item => item.area as Area),
      ignore_commerce_anchor: org.ignore_commerce_anchor,
      highest_diamonds_limit: org.highest_diamonds_limit,
      rank_league_limit: org.rank_league_limit as AnchorRankLeague | null,
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
    },
  };
}
