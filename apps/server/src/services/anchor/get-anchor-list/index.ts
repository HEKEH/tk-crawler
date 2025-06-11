import type { Logger } from '@tk-crawler/shared';
import assert from 'node:assert';
import {
  ANCHOR_LIST_QUERY_COUNT_LIMIT,
  type AnchorRankLeague,
  type Area,
  type DisplayedAnchorItem,
  type GetAnchorListRequest,
  type GetAnchorListResponseData,
  type OrgMemberItem,
  type Region,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { AnchorInviteCheckTableAlias, AnchorTableAlias } from './constants';
import { transformAnchorListFilterValuesToRawSql } from './filter';
import { transformAnchorListOrderByToRawSql } from './order-by';

const PAGE_SIZE_LIMIT = 1000;
// const CACHE_TTL = 120; // 缓存2分钟

// 清除指定机构的缓存
// export async function clearAnchorListCache(org_id: string) {
//   // 这个函数没啥必要了。
//   const pattern = `anchor_list:${org_id}:*`;
//   const keys = await redisClient.keys(pattern);
//   if (keys.length > 0) {
//     await redisClient.del(...keys);
//   }
// }

// 首先定义查询结果的类型
interface QueryResult {
  id: bigint;
  org_id: bigint;
  anchor_id: bigint;
  checked_at: Date;
  checked_by: bigint | null;
  checked_result: number;
  area: string;
  created_at: Date;
  updated_at: Date;
  invite_type: number;
  user_id: bigint;
  display_id: string;
  rank_league: string | null;
  region: string;
  has_commerce_goods: boolean;
  follower_count: number;
  audience_count: number;
  current_diamonds: number;
  last_diamonds: number;
  highest_diamonds: number;
  room_id: bigint;
  level: number;
  tag: string | null;
  anchor_updated_at: Date;
  assign_to: bigint | null;
  assigned_user_display_name?: string;
  contacted_by: bigint | null;
  contacted_user_display_name?: string;
  total_count: bigint;
}

export async function getAnchorList(
  request: GetAnchorListRequest & { org_id: string },
  logger: Logger,
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

  // // 生成缓存key，使用更精确的key
  // const cacheKey = `anchor_list:${org_id}:${page_num}:${page_size}:${JSON.stringify(filter || {})}:${JSON.stringify(order_by || {})}:${include_task_assign}:${include_anchor_contact}`;

  // // 尝试从缓存获取
  // const cachedData = await redisClient.get(cacheKey);
  // if (cachedData) {
  //   return JSON.parse(cachedData);
  // }

  const startTime = Date.now();
  const { whereClause, params } = transformAnchorListFilterValuesToRawSql(
    filter,
    org_id,
  );
  const orderByClause = transformAnchorListOrderByToRawSql(order_by);

  // Pre-build table aliases to reduce string length
  const a = AnchorTableAlias;
  const aic = AnchorInviteCheckTableAlias;

  // 构建总数查询
  const countSql = `SELECT COUNT(*) as total_count FROM (SELECT id FROM AnchorInviteCheck ${aic} INNER JOIN Anchor ${a} ON ${a}.user_id = ${aic}.anchor_id ${whereClause} LIMIT ${ANCHOR_LIST_QUERY_COUNT_LIMIT}) as t`;

  // 构建主查询
  const sql = `
SELECT
  ${aic}.id,
  ${aic}.org_id,
  ${aic}.anchor_id,
  ${aic}.checked_at,
  ${aic}.checked_by,
  ${aic}.checked_result,
  ${aic}.area,
  ${aic}.created_at,
  ${aic}.updated_at,
  ${aic}.invite_type,
  ${aic}.assign_to,
  ${aic}.contacted_by,
  ${a}.user_id,
  ${a}.display_id,
  ${a}.rank_league,
  ${a}.region,
  ${a}.has_commerce_goods,
  ${a}.follower_count,
  ${a}.audience_count,
  ${a}.current_diamonds,
  ${a}.last_diamonds,
  ${a}.highest_diamonds,
  ${a}.room_id,
  ${a}.level,
  ${a}.tag,
  ${a}.updated_at as anchor_updated_at
  ${include_task_assign ? `,au.id as assign_to, au.display_name as assigned_user_display_name` : ''}
  ${include_anchor_contact ? `,cu.id as contacted_by, cu.display_name as contacted_user_display_name` : ''}
  FROM AnchorInviteCheck ${aic}
  INNER JOIN Anchor ${a} ON ${a}.user_id = ${aic}.anchor_id
  ${include_task_assign ? `LEFT JOIN OrgUser au ON au.id = ${aic}.assign_to` : ''}
  ${include_anchor_contact ? `LEFT JOIN OrgUser cu ON cu.id = ${aic}.contacted_by` : ''}
  ${whereClause}
  ${orderByClause}
  LIMIT ?
  OFFSET ?
`;

  // 并行执行两个查询
  const [countResult, queryResult] = await Promise.all([
    mysqlClient.prismaClient.$queryRawUnsafe<{ total_count: bigint }[]>(
      countSql,
      ...params,
    ),
    mysqlClient.prismaClient.$queryRawUnsafe<QueryResult[]>(
      sql,
      ...params,
      page_size,
      (page_num - 1) * page_size,
    ),
  ]);

  const total = Number(countResult[0]?.total_count || 0);

  const endTime = Date.now();
  logger.info(
    `[Get Anchor List] [orgId: ${org_id}] [pageSize: ${page_size}] sql time cost: ${endTime - startTime}ms`,
  );

  function transUserProps(
    user: { id: bigint; display_name: string } | null,
  ): Pick<OrgMemberItem, 'id' | 'display_name'> | null {
    if (!user) {
      return null;
    }
    return {
      id: user.id.toString(),
      display_name: user.display_name,
    };
  }

  const list: DisplayedAnchorItem[] = queryResult.map((item: QueryResult) => {
    const data: DisplayedAnchorItem = {
      id: item.id.toString(),
      user_id: item.user_id.toString(),
      display_id: item.display_id,
      invite_type: item.invite_type,
      rank_league: item.rank_league as AnchorRankLeague | null,
      region: item.region as Region,
      has_commerce_goods: item.has_commerce_goods,
      follower_count: item.follower_count,
      audience_count: item.audience_count,
      current_diamonds: item.current_diamonds,
      last_diamonds: item.last_diamonds,
      highest_diamonds: item.highest_diamonds,
      room_id: item.room_id.toString(),
      level: item.level,
      tag: item.tag,
      org_id: item.org_id.toString(),
      created_at: item.created_at,
      updated_at: item.updated_at,
      area: item.area as Area,
      checked_at: item.checked_at,
      crawled_at: item.anchor_updated_at,
      checked_by: item.checked_by ? item.checked_by.toString() : null,
      checked_result: item.checked_result === 1,
    };
    if (include_task_assign) {
      data.assigned_user = item.assign_to
        ? transUserProps({
            id: item.assign_to,
            display_name: item.assigned_user_display_name!,
          })
        : null;
    }
    if (include_anchor_contact) {
      data.contacted_user = item.contacted_by
        ? transUserProps({
            id: item.contacted_by,
            display_name: item.contacted_user_display_name!,
          })
        : null;
    }
    return data;
  });

  const result = {
    list,
    total,
  };

  // // 缓存结果
  // redisClient.set(cacheKey, JSON.stringify(result), CACHE_TTL).catch(e => {
  //   logger.error('anchor-list cache fail', e);
  // });

  return result;
}

export * from './get-anchor-list-for-download';
