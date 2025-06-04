import type {
  AnchorInviteCheckOrderByInput,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import { BusinessError } from '../../../utils';

export function transformAnchorListOrderBy(
  orderBy: GetAnchorListOrderBy | undefined,
): AnchorInviteCheckOrderByInput {
  if (!orderBy || Object.keys(orderBy).length === 0) {
    // 默认时间倒序
    return {
      checked_at: 'desc',
    };
    // return {
    //   anchor: {
    //     updated_at: 'desc',
    //   },
    // };
  }
  const result: AnchorInviteCheckOrderByInput = {};
  if ('crawled_at' in orderBy && orderBy.crawled_at) {
    result.anchor = {
      updated_at: orderBy.crawled_at,
    };
  } else if ('checked_at' in orderBy && orderBy.checked_at) {
    result.checked_at = orderBy.checked_at;
  } else if ('checked_result' in orderBy && orderBy.checked_result) {
    result.checked_result = orderBy.checked_result;
  } else if ('invite_type' in orderBy && orderBy.invite_type) {
    result.invite_type = orderBy.invite_type;
  } else if ('area' in orderBy && orderBy.area) {
    result.area = orderBy.area;
  } else if ('display_id' in orderBy && orderBy.display_id) {
    result.anchor = { display_id: orderBy.display_id };
  } else if ('user_id' in orderBy && orderBy.user_id) {
    result.anchor = { user_id: orderBy.user_id };
  } else if ('follower_count' in orderBy && orderBy.follower_count) {
    result.anchor = { follower_count: orderBy.follower_count };
  } else if ('audience_count' in orderBy && orderBy.audience_count) {
    result.anchor = { audience_count: orderBy.audience_count };
  } else if ('current_diamonds' in orderBy && orderBy.current_diamonds) {
    result.anchor = { current_diamonds: orderBy.current_diamonds };
  } else if ('last_diamonds' in orderBy && orderBy.last_diamonds) {
    result.anchor = { last_diamonds: orderBy.last_diamonds };
  } else if ('highest_diamonds' in orderBy && orderBy.highest_diamonds) {
    result.anchor = { highest_diamonds: orderBy.highest_diamonds };
  } else if ('rank_league' in orderBy && orderBy.rank_league) {
    result.anchor = { rank_league: orderBy.rank_league };
  } else if ('region' in orderBy && orderBy.region) {
    result.anchor = { region: orderBy.region };
  } else if ('has_commerce_goods' in orderBy && orderBy.has_commerce_goods) {
    result.anchor = { has_commerce_goods: orderBy.has_commerce_goods };
  } else if ('tag' in orderBy && orderBy.tag) {
    result.anchor = { tag: orderBy.tag };
  } else if ('room_id' in orderBy && orderBy.room_id) {
    result.anchor = { room_id: orderBy.room_id };
  } else if ('assign_to' in orderBy && orderBy.assign_to) {
    result.assign_to = orderBy.assign_to;
  } else if ('contacted_by' in orderBy && orderBy.contacted_by) {
    result.contacted_by = orderBy.contacted_by;
  } else {
    throw new BusinessError(`Invalid orderBy: ${JSON.stringify(orderBy)}`);
  }

  return result;
}

// 字段映射表
const fieldMap: Record<string, { field: string; table: string }> = {
  crawled_at: { field: 'updated_at', table: 'a' },
  checked_at: { field: 'checked_at', table: 'aic' },
  checked_result: { field: 'checked_result', table: 'aic' },
  invite_type: { field: 'invite_type', table: 'aic' },
  area: { field: 'area', table: 'aic' },
  display_id: { field: 'display_id', table: 'a' },
  user_id: { field: 'user_id', table: 'a' },
  follower_count: { field: 'follower_count', table: 'a' },
  audience_count: { field: 'audience_count', table: 'a' },
  current_diamonds: { field: 'current_diamonds', table: 'a' },
  last_diamonds: { field: 'last_diamonds', table: 'a' },
  highest_diamonds: { field: 'highest_diamonds', table: 'a' },
  rank_league: { field: 'rank_league', table: 'a' },
  region: { field: 'region', table: 'a' },
  has_commerce_goods: { field: 'has_commerce_goods', table: 'a' },
  tag: { field: 'tag', table: 'a' },
  room_id: { field: 'room_id', table: 'a' },
  assign_to: { field: 'assign_to', table: 'aic' },
  contacted_by: { field: 'contacted_by', table: 'aic' },
};

export function transformAnchorListOrderByToRawSql(
  orderBy: GetAnchorListOrderBy | undefined,
): string {
  if (!orderBy || Object.keys(orderBy).length === 0) {
    // 默认时间倒序
    return 'ORDER BY aic.checked_at DESC';
  }

  // 获取排序字段和方向
  const validOrderBy = Object.entries(orderBy).find(
    ([_, value]) => value !== undefined,
  );

  if (!validOrderBy) {
    // 如果没有有效的排序字段，使用默认排序
    return 'ORDER BY aic.checked_at DESC';
  }

  const [orderField, orderDirection] = validOrderBy;

  // 检查字段是否有效
  if (!fieldMap[orderField]) {
    throw new BusinessError(`Invalid orderBy field: ${orderField}`);
  }

  // 构建排序子句
  const { field, table } = fieldMap[orderField];
  return `ORDER BY ${table}.${field} ${orderDirection.toUpperCase()}`;
}
