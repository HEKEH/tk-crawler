import type {
  AnchorListWhereInput,
  GetAnchorListFilter,
} from '@tk-crawler/biz-shared';
import type { Prisma } from '@tk-crawler/database';

export function transformAnchorListFilterValues(
  filterValues: GetAnchorListFilter = {},
  orgId: string,
): AnchorListWhereInput {
  const filter: AnchorListWhereInput = {
    org_id: BigInt(orgId),
  };

  const {
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
      // 语法问题，不能直接写has_commerce_goods，只能这么写
      if (!anchorFilter.AND) {
        anchorFilter.AND = [];
      }
      (anchorFilter.AND as Array<Prisma.AnchorWhereInput>).push({
        OR: [
          {
            has_commerce_goods: false,
          },
          {
            has_commerce_goods: null,
          },
        ],
      });
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
  }

  if (invite_type !== undefined) {
    filter.invite_type = invite_type;
  }

  if (Object.keys(anchorFilter).length > 0) {
    filter.anchor = anchorFilter;
  }

  return filter;
}
