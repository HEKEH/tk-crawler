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
  logger.info(
    `[search-anchors-need-check] search anchors need check: ${data.org_id} ${data.area}`,
  );
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
          checked_at: {
            gt: new Date(Date.now() - ANCHOR_CHECK_OUTDATE_TIME),
          },
        },
      },
    },
  });
  logger.trace(
    `[search-anchors-need-check] search anchors need check result: ${beautifyJsonStringify(result)}`,
  );
  return result.map(item => ({
    user_id: item.user_id.toString(),
    display_id: item.display_id,
    region: item.region as Region,
    has_commerce_goods: item.has_commerce_goods,
  }));
}
