import {
  ANCHOR_CHECK_OUTDATE_DAYS,
  AnchorRankLeague,
  type Area,
  type BroadcastAnchorMessageData,
  type OrgAnchorSearchPolicies,
  type Region,
} from '@tk-crawler/biz-shared';
import { mysqlClient, Prisma } from '@tk-crawler/database';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../infra/logger';

export async function searchAnchorsNeedCheck(data: {
  org_id: string;
  org_name: string;
  area: Area;
  take: number;
  anchor_search_policies: OrgAnchorSearchPolicies;
  only_not_checked?: boolean;
}): Promise<BroadcastAnchorMessageData[]> {
  logger.info(
    `[search-anchors-need-check] search anchors need check:`,
    beautifyJsonStringify({
      org_id: data.org_id,
      org_name: data.org_name,
      area: data.area,
      anchor_search_policies: data.anchor_search_policies,
    }),
  );
  const dbStart = Date.now();

  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - ANCHOR_CHECK_OUTDATE_DAYS);
  checkDate.setHours(0, 0, 0, 0); // Set to start of day
  const { highest_diamonds_limit, rank_league_limit, ignore_commerce_anchor } =
    data.anchor_search_policies;

  const result: (Omit<BroadcastAnchorMessageData, 'has_commerce_goods'> & {
    has_commerce_goods: 1 | 0;
  })[] = await mysqlClient.prismaClient.$queryRaw`
  SELECT
    a.user_id,
    a.display_id,
    a.region,
    a.has_commerce_goods
  FROM Anchor a
  WHERE a.area = ${data.area}
    ${ignore_commerce_anchor ? Prisma.sql`AND a.has_commerce_goods = false` : Prisma.empty}
    ${highest_diamonds_limit ? Prisma.sql`AND a.highest_diamonds >= ${data.anchor_search_policies.highest_diamonds_limit}` : Prisma.empty}
    ${rank_league_limit && rank_league_limit !== AnchorRankLeague.A1 ? Prisma.sql`AND a.rank_league >= ${data.anchor_search_policies.rank_league_limit}` : Prisma.empty}
    AND NOT EXISTS (
      SELECT 1
      FROM AnchorInviteCheck ic
      WHERE ic.anchor_id = a.user_id
        AND ic.org_id = ${BigInt(data.org_id)}
        ${
          data.only_not_checked
            ? Prisma.empty
            : Prisma.sql`AND (ic.contacted_by IS NOT NULL OR ic.checked_at > ${checkDate})`
        }
    )
  ORDER BY a.updated_at DESC
  LIMIT ${data.take}
`;
  logger.info(
    `[search-anchors-need-check] [orgId: ${data.org_id}] [orgName: ${data.org_name}] [area: ${data.area}] db query cost: ${Date.now() - dbStart}ms`,
  );
  logger.trace(
    `[search-anchors-need-check] [orgId: ${data.org_id}] [orgName: ${data.org_name}] [area: ${data.area}] search anchors need check result: ${beautifyJsonStringify(result)}`,
  );
  logger.info(
    `[search-anchors-need-check] [orgId: ${data.org_id}] [orgName: ${data.org_name}] [area: ${data.area}] search anchors need check result count: ${result.length}`,
  );
  return result.map(item => ({
    user_id: item.user_id.toString(),
    display_id: item.display_id,
    region: item.region as Region,
    has_commerce_goods: item.has_commerce_goods === 1,
  }));
}
