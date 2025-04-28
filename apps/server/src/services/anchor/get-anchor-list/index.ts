import type {
  AnchorRankLeague,
  Area,
  DisplayedAnchorItem,
  GetAnchorListRequest,
  GetAnchorListResponseData,
  OrgMemberItem,
  Region,
} from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { transformAnchorListFilterValues } from './filter';
import { transformAnchorListOrderBy } from './order-by';

export async function getAnchorList(
  request: GetAnchorListRequest & { org_id: string },
): Promise<GetAnchorListResponseData> {
  assert(request.org_id, '机构ID不能为空');
  assert(request.page_num, '页码不能为空');
  assert(request.page_size, '每页数量不能为空');
  assert(request.page_size <= 1000, '每页数量不能超过1000');

  const {
    page_num,
    page_size,
    filter,
    order_by,
    org_id,
    include_task_assign,
    include_anchor_contact,
  } = request;
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
        assigned_user: include_task_assign
          ? {
              omit: {
                password: true,
              },
            }
          : false,
        contacted_user: include_anchor_contact
          ? {
              omit: {
                password: true,
              },
            }
          : false,
      },
    }),
    mysqlClient.prismaClient.anchorInviteCheck.count({
      where,
    }),
  ]);

  function transUserProps(
    user: (typeof anchorInviteChecks)[number]['assigned_user'] | null,
  ): Omit<OrgMemberItem, 'password'> | null {
    if (!user) {
      return null;
    }
    return {
      id: user.id.toString(),
      username: user.username,
      display_name: user.display_name,
      org_id: user.org_id.toString(),
      role_id: user.role_id,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email: user.email,
      mobile: user.mobile,
    };
  }

  const list: DisplayedAnchorItem[] = anchorInviteChecks.map(item => {
    const { anchor } = item;
    const data: DisplayedAnchorItem = {
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
      crawled_at: item.anchor.updated_at,
      checked_by: item.checked_by ? item.checked_by.toString() : null,
      checked_result: item.checked_result === 1,
    };
    if (include_task_assign) {
      data.assigned_user = transUserProps(item.assigned_user);
    }
    if (include_anchor_contact) {
      data.contacted_user = transUserProps(item.contacted_user);
    }
    return data;
  });

  const result = {
    list,
    total,
  };

  logger.info('[Get Anchor List] success', { length: result.list?.length });

  return result;
}
