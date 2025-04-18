import type {
  AnchorRankLeague,
  Area,
  DisplayedAnchorItem,
  GetAnchorListRequest,
  GetAnchorListResponseData,
  Region,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { beautifyJsonStringify } from '@tk-crawler/shared';
import { logger } from '../../../infra/logger';
import { transformAnchorListFilterValues } from './filter';
import { transformAnchorListOrderBy } from './order-by';

export async function getAnchorList(
  request: GetAnchorListRequest & { org_id: string },
): Promise<GetAnchorListResponseData> {
  logger.info('[Get Anchor List]', beautifyJsonStringify({ request }));
  assert(request.org_id, 'org_id is required');
  assert(request.page_num, 'page_num is required');
  assert(request.page_size, 'page_size is required');
  assert(request.page_size <= 200, 'page_size is too large');

  const { page_num, page_size, filter, order_by, org_id } = request;
  const where = transformAnchorListFilterValues(filter, org_id);
  const orderBy = transformAnchorListOrderBy(order_by);

  const [anchorInviteChecks, total] = await Promise.all([
    mysqlClient.prismaClient.anchorInviteCheck.findMany({
      where,
      orderBy,
      skip: (page_num - 1) * page_size,
      take: page_size,
      include: {
        anchor: true,
      },
    }),
    mysqlClient.prismaClient.anchorInviteCheck.count({
      where,
    }),
  ]);

  const list: DisplayedAnchorItem[] = anchorInviteChecks.map(item => {
    const { anchor } = item;
    return {
      id: item.id.toString(),
      user_id: anchor.user_id.toString(),
      display_id: anchor.display_id,
      invite_type: item.invite_type,
      rank_league: anchor.rank_league as AnchorRankLeague | null,
      region: anchor.region as Region,
      has_commerce_goods: anchor.has_commerce_goods,
      follower_count: anchor.follower_count,
      audience_count: anchor.audience_count,
      current_diamonds: anchor.current_diamonds,
      last_diamonds: anchor.last_diamonds,
      highest_diamonds: anchor.highest_diamonds,
      room_id: anchor.room_id.toString(),
      level: anchor.level,
      tag: anchor.tag,
      org_id: item.org_id.toString(),
      created_at: item.created_at,
      updated_at: item.updated_at,
      area: item.area as Area,
      checked_at: item.checked_at,
      checked_by: item.checked_by ? item.checked_by.toString() : null,
      checked_result: item.checked_result === 1,
    };
  });

  const result = {
    list,
    total,
  };

  logger.info('[Get Anchor List] success', beautifyJsonStringify({ result }));

  return result;
}
