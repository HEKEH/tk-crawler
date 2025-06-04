import type {
  AnchorListWhereInput,
  GetAnchorListFilter,
} from '@tk-crawler/biz-shared';
import type { RangeFilter } from '@tk-crawler/shared';
import { AnchorInviteCheckTableAlias, AnchorTableAlias } from './constants';

function addRangeFilterConditions<T>(
  conditions: string[],
  params: any[],
  field: RangeFilter<T> | undefined,
  tableAlias: string,
  fieldName: string,
) {
  if (field !== undefined) {
    if ('gte' in field && field.gte !== undefined) {
      conditions.push(`${tableAlias}.${fieldName} >= ?`);
      params.push(field.gte);
    }
    if ('lte' in field && field.lte !== undefined) {
      conditions.push(`${tableAlias}.${fieldName} <= ?`);
      params.push(field.lte);
    }
  }
}

export function transformAnchorListFilterValues(
  filterValues: GetAnchorListFilter = {},
  orgId: string,
): AnchorListWhereInput {
  const filter: AnchorListWhereInput = {
    org_id: BigInt(orgId),
  };

  const {
    id,
    user_id,
    display_id,
    rank_league,
    region,
    has_commerce_goods,
    tag,
    follower_count,
    audience_count,
    current_diamonds,
    last_diamonds,
    highest_diamonds,
    room_id,
    checked_result,
    checked_at,
    crawled_at,
    area,
    invite_type,
    assign_to,
    contacted_by,
  } = filterValues;
  const anchorFilter: AnchorListWhereInput['anchor'] = {};
  if (user_id?.trim()) {
    anchorFilter.user_id = BigInt(user_id.trim());
  }
  if (display_id?.trim()) {
    anchorFilter.display_id = display_id.trim();
  }
  if (invite_type !== undefined) {
    filter.invite_type = invite_type;
  }
  if (rank_league !== undefined) {
    anchorFilter.rank_league = rank_league;
  }
  if (region !== undefined) {
    anchorFilter.region = region;
  }
  if (has_commerce_goods !== undefined) {
    if (has_commerce_goods) {
      anchorFilter.has_commerce_goods = true;
    } else {
      anchorFilter.has_commerce_goods = false;
    }
  }
  if (tag) {
    anchorFilter.tag = tag;
  }
  if (follower_count !== undefined) {
    anchorFilter.follower_count = follower_count;
  }
  if (audience_count !== undefined) {
    anchorFilter.audience_count = audience_count;
  }
  if (current_diamonds !== undefined) {
    anchorFilter.current_diamonds = current_diamonds;
  }
  if (last_diamonds !== undefined) {
    anchorFilter.last_diamonds = last_diamonds;
  }
  if (highest_diamonds !== undefined) {
    anchorFilter.highest_diamonds = highest_diamonds;
  }
  if (crawled_at !== undefined) {
    anchorFilter.updated_at = crawled_at;
  }
  if (room_id?.trim()) {
    anchorFilter.room_id = BigInt(room_id.trim());
  }

  if (id?.trim()) {
    filter.id = BigInt(id.trim());
  }

  if (checked_result !== undefined) {
    filter.checked_result = checked_result === true ? 1 : 0;
  }
  if (checked_at !== undefined) {
    filter.checked_at = checked_at;
  }
  if (assign_to !== undefined && assign_to !== '') {
    if (assign_to === 'not_assigned') {
      filter.assign_to = null;
    } else if (assign_to === 'assigned') {
      filter.assign_to = {
        not: null,
      };
    } else {
      filter.assign_to = BigInt(assign_to);
    }
  }
  if (contacted_by !== undefined && contacted_by !== '') {
    if (contacted_by === 'not_contacted') {
      filter.contacted_by = null;
    } else if (contacted_by === 'contacted') {
      filter.contacted_by = {
        not: null,
      };
    } else {
      filter.contacted_by = BigInt(contacted_by);
    }
  }

  if (area) {
    filter.area = area;
    anchorFilter.area = area;
  }

  if (invite_type !== undefined) {
    filter.invite_type = invite_type;
  }

  if (Object.keys(anchorFilter).length > 0) {
    filter.anchor = anchorFilter;
  }

  return filter;
}

export function transformAnchorListFilterValuesToRawSql(
  filterValues: GetAnchorListFilter = {},
  orgId: string,
): {
  whereClause: string;
  params: any[];
} {
  const conditions: string[] = [];
  const params: any[] = [];

  const {
    id,
    user_id,
    display_id,
    rank_league,
    region,
    has_commerce_goods,
    tag,
    follower_count,
    audience_count,
    current_diamonds,
    last_diamonds,
    highest_diamonds,
    room_id,
    checked_result,
    checked_at,
    crawled_at,
    area,
    invite_type,
    assign_to,
    contacted_by,
  } = filterValues;

  // 1. Primary and unique indexes first
  conditions.push(`${AnchorInviteCheckTableAlias}.org_id = ?`);
  params.push(BigInt(orgId));

  if (id?.trim()) {
    conditions.push(`${AnchorInviteCheckTableAlias}.id = ?`);
    params.push(BigInt(id.trim()));
  }

  // 2. Indexed equality conditions
  if (checked_result !== undefined) {
    conditions.push(`${AnchorInviteCheckTableAlias}.checked_result = ?`);
    params.push(checked_result === true ? 1 : 0);
  }

  if (area) {
    conditions.push(`${AnchorInviteCheckTableAlias}.area = ?`);
    params.push(area);
    // 两个表都有area索引，使用两个条件确保数据一致性
    conditions.push(`${AnchorTableAlias}.area = ?`);
    params.push(area);
  }

  if (region) {
    conditions.push(`${AnchorTableAlias}.region = ?`);
    params.push(region);
  }

  if (has_commerce_goods !== undefined) {
    conditions.push(`${AnchorTableAlias}.has_commerce_goods = ?`);
    params.push(has_commerce_goods);
  }

  if (rank_league !== undefined) {
    conditions.push(`${AnchorTableAlias}.rank_league = ?`);
    params.push(rank_league);
  }

  // 3. Indexed range conditions
  addRangeFilterConditions(
    conditions,
    params,
    checked_at,
    AnchorInviteCheckTableAlias,
    'checked_at',
  );

  // 使用复合索引 [area, updated_at]
  addRangeFilterConditions(
    conditions,
    params,
    crawled_at,
    AnchorTableAlias,
    'updated_at',
  );

  addRangeFilterConditions(
    conditions,
    params,
    follower_count,
    AnchorTableAlias,
    'follower_count',
  );

  addRangeFilterConditions(
    conditions,
    params,
    highest_diamonds,
    AnchorTableAlias,
    'highest_diamonds',
  );

  // 4. Non-indexed equality conditions
  if (user_id?.trim()) {
    conditions.push(`${AnchorInviteCheckTableAlias}.anchor_id = ?`);
    params.push(BigInt(user_id.trim()));
    conditions.push(`${AnchorTableAlias}.user_id = ?`);
    params.push(BigInt(user_id.trim()));
  }

  if (room_id?.trim()) {
    conditions.push(`${AnchorTableAlias}.room_id = ?`);
    params.push(BigInt(room_id.trim()));
  }

  if (display_id?.trim()) {
    conditions.push(`${AnchorTableAlias}.display_id = ?`);
    params.push(display_id.trim());
  }

  if (tag) {
    conditions.push(`${AnchorTableAlias}.tag = ?`);
    params.push(tag);
  }

  if (invite_type !== undefined) {
    conditions.push(`${AnchorInviteCheckTableAlias}.invite_type = ?`);
    params.push(invite_type);
  }

  // 5. Non-indexed range conditions
  addRangeFilterConditions(
    conditions,
    params,
    rank_league,
    AnchorTableAlias,
    'rank_league',
  );
  addRangeFilterConditions(
    conditions,
    params,
    audience_count,
    AnchorTableAlias,
    'audience_count',
  );
  addRangeFilterConditions(
    conditions,
    params,
    current_diamonds,
    AnchorTableAlias,
    'current_diamonds',
  );
  addRangeFilterConditions(
    conditions,
    params,
    last_diamonds,
    AnchorTableAlias,
    'last_diamonds',
  );

  // 6. Special conditions (NULL checks)
  if (assign_to !== undefined && assign_to !== '') {
    if (assign_to === 'not_assigned') {
      conditions.push(`${AnchorInviteCheckTableAlias}.assign_to IS NULL`);
    } else if (assign_to === 'assigned') {
      conditions.push(`${AnchorInviteCheckTableAlias}.assign_to IS NOT NULL`);
    } else {
      conditions.push(`${AnchorInviteCheckTableAlias}.assign_to = ?`);
      params.push(BigInt(assign_to));
    }
  }

  if (contacted_by !== undefined && contacted_by !== '') {
    if (contacted_by === 'not_contacted') {
      conditions.push(`${AnchorInviteCheckTableAlias}.contacted_by IS NULL`);
    } else if (contacted_by === 'contacted') {
      conditions.push(
        `${AnchorInviteCheckTableAlias}.contacted_by IS NOT NULL`,
      );
    } else {
      conditions.push(`${AnchorInviteCheckTableAlias}.contacted_by = ?`);
      params.push(BigInt(contacted_by));
    }
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}
