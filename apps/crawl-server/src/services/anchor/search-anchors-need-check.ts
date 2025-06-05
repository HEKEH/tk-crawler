import {
  ANCHOR_CHECK_OUTDATE_DAYS,
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
}): Promise<BroadcastAnchorMessageData[]> {
  logger.info(`[search-anchors-need-check] search anchors need check:`, {
    org_id: data.org_id,
    org_name: data.org_name,
    area: data.area,
  });
  const dbStart = Date.now();

  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - ANCHOR_CHECK_OUTDATE_DAYS);
  checkDate.setHours(0, 0, 0, 0); // Set to start of day

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
    ${data.anchor_search_policies.ignore_commerce_anchor ? Prisma.sql`AND a.has_commerce_goods = false` : Prisma.empty}
    AND NOT EXISTS (
      SELECT 1
      FROM AnchorInviteCheck ic
      WHERE ic.anchor_id = a.user_id
        AND ic.org_id = ${BigInt(data.org_id)}
        AND ic.area = ${data.area}
        AND (
          ic.contacted_by IS NOT NULL
          OR ic.checked_at > ${checkDate}
        )
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
