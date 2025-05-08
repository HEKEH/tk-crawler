import type {
  Area,
  BroadcastAnchorMessageData,
  Region,
} from '@tk-crawler/biz-shared';
import { getRegionsByArea } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
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
}): Promise<BroadcastAnchorMessageData[]> {
  logger.info(`[search-anchors-need-check] search anchors need check:`, {
    org_id: data.org_id,
    area: data.area,
  });
  const regions = getRegionsByArea(data.area);
  const result = await mysqlClient.prismaClient.anchor.findMany({
    orderBy: {
      updated_at: 'desc',
    },
    select: {
      user_id: true,
      display_id: true,
      region: true,
      has_commerce_goods: true,
    },
    take: data.take ?? ANCHORS_CHECK_NUMBER,
    where: {
      region: {
        in: regions,
      },
      invite_checks: {
        none: {
          org_id: BigInt(data.org_id),
          OR: [
            {
              contacted_by: {
                // 已建联的不用再检查
                not: null,
              },
            },
            {
              checked_at: {
                gt: new Date(Date.now() - ANCHOR_CHECK_OUTDATE_TIME),
              },
            },
          ],
        },
      },
    },
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
    has_commerce_goods: item.has_commerce_goods,
  }));
}
