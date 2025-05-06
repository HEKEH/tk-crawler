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
import { mysqlClient, redisClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { transformAnchorListFilterValues } from './filter';
import { transformAnchorListOrderBy } from './order-by';

const PAGE_SIZE_LIMIT = 1000;
const CACHE_TTL = 60; // 缓存1分钟

// 清除指定机构的缓存
export async function clearAnchorListCache(org_id: string) {
  const pattern = `anchor_list:${org_id}:*`;
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}

export async function getAnchorList(
  request: GetAnchorListRequest & { org_id: string },
): Promise<GetAnchorListResponseData> {
  assert(request.org_id, '机构ID不能为空');
  assert(request.page_num, '页码不能为空');
  assert(request.page_size, '每页数量不能为空');
  assert(
    request.page_size <= PAGE_SIZE_LIMIT,
    `每页数量不能超过${PAGE_SIZE_LIMIT}`,
  );

  const {
    page_num,
    page_size,
    filter,
    order_by,
    org_id,
    include_task_assign,
    include_anchor_contact,
  } = request;

  // 生成缓存key，使用更精确的key
  const cacheKey = `anchor_list:${org_id}:${page_num}:${page_size}:${JSON.stringify(filter || {})}:${JSON.stringify(order_by || {})}:${include_task_assign}:${include_anchor_contact}`;

  // 尝试从缓存获取
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const where = transformAnchorListFilterValues(filter, org_id);
  const orderBy = transformAnchorListOrderBy(order_by);

  const [anchorInviteChecks, total] = await Promise.all([
    mysqlClient.prismaClient.anchorInviteCheck.findMany({
      where,
      orderBy,
      skip: (page_num - 1) * page_size,
      take: page_size,
      select: {
        id: true,
        org_id: true,
        anchor_id: true,
        checked_at: true,
        checked_by: true,
        checked_result: true,
        area: true,
        created_at: true,
        updated_at: true,
        invite_type: true,
        anchor: {
          select: {
            user_id: true,
            display_id: true,
            rank_league: true,
            region: true,
            has_commerce_goods: true,
            follower_count: true,
            audience_count: true,
            current_diamonds: true,
            last_diamonds: true,
            highest_diamonds: true,
            room_id: true,
            level: true,
            tag: true,
            updated_at: true,
          },
        },
        assigned_user: include_task_assign
          ? {
              select: {
                id: true,
                username: true,
                display_name: true,
                org_id: true,
                role_id: true,
                status: true,
                created_at: true,
                updated_at: true,
                email: true,
                mobile: true,
              },
            }
          : false,
        contacted_user: include_anchor_contact
          ? {
              select: {
                id: true,
                username: true,
                display_name: true,
                org_id: true,
                role_id: true,
                status: true,
                created_at: true,
                updated_at: true,
                email: true,
                mobile: true,
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

  // 缓存结果
  redisClient.set(cacheKey, JSON.stringify(result), CACHE_TTL).catch(e => {
    logger.error('anchor-list cache fail', e);
  });

  return result;
}

export * from './get-anchor-list-for-download';
