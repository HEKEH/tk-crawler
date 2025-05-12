import type {
  Area,
  BroadcastAnchorMessageData,
  OrgAnchorSearchPolicies,
  Region,
} from '@tk-crawler/biz-shared';
import { mysqlClient, Prisma } from '@tk-crawler/database';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import {
  ANCHOR_CHECK_OUTDATE_TIME,
  ANCHORS_CHECK_NUMBER,
} from '../../constants';
import { logger } from '../../infra/logger';

export async function searchAnchorsNeedCheck(data: {
  org_id: string;
  area: Area;
  take?: number;
  anchor_search_policies: OrgAnchorSearchPolicies;
}): Promise<BroadcastAnchorMessageData[]> {
  logger.info(`[search-anchors-need-check] search anchors need check:`, {
    org_id: data.org_id,
    area: data.area,
  });
  const dbStart = Date.now();
  // const result = await mysqlClient.prismaClient.anchor.findMany({
  //   orderBy: {
  //     updated_at: 'desc',
  //   },
  //   select: {
  //     user_id: true,
  //     display_id: true,
  //     region: true,
  //     has_commerce_goods: true,
  //   },
  //   take: data.take ?? ANCHORS_CHECK_NUMBER,
  //   where: {
  //     area: data.area,
  //     has_commerce_goods: data.anchor_search_policies.ignore_commerce_anchor
  //       ? false
  //       : undefined,
  //     invite_checks: {
  //       none: {
  //         org_id: BigInt(data.org_id),
  //         OR: [
  //           {
  //             contacted_by: {
  //               // 已建联的不用再检查
  //               not: null,
  //             },
  //           },
  //           {
  //             checked_at: {
  //               gt: new Date(Date.now() - ANCHOR_CHECK_OUTDATE_TIME),
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   },
  // });
  const result: (Omit<BroadcastAnchorMessageData, 'has_commerce_goods'> & {
    has_commerce_goods: 1 | 0;
  })[] = await mysqlClient.prismaClient.$queryRaw`
  SELECT
    a.user_id,
    a.display_id,
    a.region,
    a.has_commerce_goods
  FROM Anchor a FORCE INDEX (area_updated_at_desc)
  WHERE a.area = ${data.area}
    ${data.anchor_search_policies.ignore_commerce_anchor ? Prisma.sql`AND a.has_commerce_goods = false` : Prisma.empty}
    AND NOT EXISTS (
      SELECT 1
      FROM AnchorInviteCheck ic
      WHERE ic.anchor_id = a.user_id
        AND ic.org_id = ${BigInt(data.org_id)}
        AND (
          ic.contacted_by IS NOT NULL
          OR ic.checked_at > ${new Date(Date.now() - ANCHOR_CHECK_OUTDATE_TIME)}
        )
    )
  ORDER BY a.updated_at DESC
  LIMIT ${data.take ?? ANCHORS_CHECK_NUMBER}
`;
  logger.info(`[search-anchors-need-check] after db query`, {
    cost: Date.now() - dbStart,
  });
  logger.trace(
    `[search-anchors-need-check] [orgId: ${data.org_id}] [area: ${data.area}] search anchors need check result: ${beautifyJsonStringify(result)}`,
  );
  logger.info(
    `[search-anchors-need-check] [orgId: ${data.org_id}] [area: ${data.area}] search anchors need check result count: ${result.length}`,
  );
  return result.map(item => ({
    user_id: item.user_id.toString(),
    display_id: item.display_id,
    region: item.region as Region,
    has_commerce_goods: item.has_commerce_goods === 1,
  }));
}
