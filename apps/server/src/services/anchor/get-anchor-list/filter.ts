import type {
  AnchorListWhereInput,
  GetAnchorListFilter,
} from '@tk-crawler/biz-shared';

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

  // 基础条件
  conditions.push('aic.org_id = ?');
  params.push(BigInt(orgId));

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

  // anchor表条件
  if (user_id?.trim()) {
    conditions.push('a.user_id = ?');
    params.push(BigInt(user_id.trim()));
  }

  if (display_id?.trim()) {
    conditions.push('a.display_id = ?');
    params.push(display_id.trim());
  }

  if (region !== undefined) {
    conditions.push('a.region = ?');
    params.push(region);
  }

  if (has_commerce_goods !== undefined) {
    conditions.push('a.has_commerce_goods = ?');
    params.push(has_commerce_goods);
  }

  if (tag) {
    conditions.push('a.tag = ?');
    params.push(tag);
  }

  if (rank_league !== undefined) {
    if ('gte' in rank_league && rank_league.gte !== undefined) {
      conditions.push('a.rank_league >= ?');
      params.push(rank_league.gte);
    }
    if ('lte' in rank_league && rank_league.lte !== undefined) {
      conditions.push('a.rank_league <= ?');
      params.push(rank_league.lte);
    }
  }

  if (follower_count !== undefined) {
    if ('gte' in follower_count && follower_count.gte !== undefined) {
      conditions.push('a.follower_count >= ?');
      params.push(follower_count.gte);
    }
    if ('lte' in follower_count && follower_count.lte !== undefined) {
      conditions.push('a.follower_count <= ?');
      params.push(follower_count.lte);
    }
  }

  if (audience_count !== undefined) {
    if ('gte' in audience_count && audience_count.gte !== undefined) {
      conditions.push('a.audience_count >= ?');
      params.push(audience_count.gte);
    }
    if ('lte' in audience_count && audience_count.lte !== undefined) {
      conditions.push('a.audience_count <= ?');
      params.push(audience_count.lte);
    }
  }

  if (current_diamonds !== undefined) {
    if ('gte' in current_diamonds && current_diamonds.gte !== undefined) {
      conditions.push('a.current_diamonds >= ?');
      params.push(current_diamonds.gte);
    }
    if ('lte' in current_diamonds && current_diamonds.lte !== undefined) {
      conditions.push('a.current_diamonds <= ?');
      params.push(current_diamonds.lte);
    }
  }

  if (last_diamonds !== undefined) {
    if ('gte' in last_diamonds && last_diamonds.gte !== undefined) {
      conditions.push('a.last_diamonds >= ?');
      params.push(last_diamonds.gte);
    }
    if ('lte' in last_diamonds && last_diamonds.lte !== undefined) {
      conditions.push('a.last_diamonds <= ?');
      params.push(last_diamonds.lte);
    }
  }

  if (highest_diamonds !== undefined) {
    if ('gte' in highest_diamonds && highest_diamonds.gte !== undefined) {
      conditions.push('a.highest_diamonds >= ?');
      params.push(highest_diamonds.gte);
    }
    if ('lte' in highest_diamonds && highest_diamonds.lte !== undefined) {
      conditions.push('a.highest_diamonds <= ?');
      params.push(highest_diamonds.lte);
    }
  }

  if (crawled_at !== undefined && crawled_at !== null) {
    if ('gte' in crawled_at && crawled_at.gte) {
      conditions.push('a.updated_at >= ?');
      params.push(crawled_at.gte);
    }
    if ('lte' in crawled_at && crawled_at.lte) {
      conditions.push('a.updated_at <= ?');
      params.push(crawled_at.lte);
    }
  }

  if (room_id?.trim()) {
    conditions.push('a.room_id = ?');
    params.push(BigInt(room_id.trim()));
  }

  // anchor_invite_check表条件
  if (id?.trim()) {
    conditions.push('aic.id = ?');
    params.push(BigInt(id.trim()));
  }

  if (checked_result !== undefined) {
    conditions.push('aic.checked_result = ?');
    params.push(checked_result === true ? 1 : 0);
  }

  if (checked_at !== undefined && checked_at !== null) {
    if ('gte' in checked_at && checked_at.gte) {
      conditions.push('aic.checked_at >= ?');
      params.push(checked_at.gte);
    }
    if ('lte' in checked_at && checked_at.lte) {
      conditions.push('aic.checked_at <= ?');
      params.push(checked_at.lte);
    }
  }

  if (area) {
    conditions.push('aic.area = ?');
    params.push(area);
    conditions.push('a.area = ?');
    params.push(area);
  }

  if (invite_type !== undefined) {
    conditions.push('aic.invite_type = ?');
    params.push(invite_type);
  }

  // 特殊条件处理
  if (assign_to !== undefined && assign_to !== '') {
    if (assign_to === 'not_assigned') {
      conditions.push('aic.assign_to IS NULL');
    } else if (assign_to === 'assigned') {
      conditions.push('aic.assign_to IS NOT NULL');
    } else {
      conditions.push('aic.assign_to = ?');
      params.push(BigInt(assign_to));
    }
  }

  if (contacted_by !== undefined && contacted_by !== '') {
    if (contacted_by === 'not_contacted') {
      conditions.push('aic.contacted_by IS NULL');
    } else if (contacted_by === 'contacted') {
      conditions.push('aic.contacted_by IS NOT NULL');
    } else {
      conditions.push('aic.contacted_by = ?');
      params.push(BigInt(contacted_by));
    }
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}
