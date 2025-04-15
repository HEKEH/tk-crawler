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
    user_id,
    display_id,
    rank_league,
    region,
    has_commerce_goods,
    follower_count,
    audience_count,
    current_diamonds,
    last_diamonds,
    highest_diamonds,

    updated_at,
    area,
    invite_type,
  } = filterValues;
  const anchorFilter: AnchorListWhereInput['anchor'] = {};
  if (user_id) {
    anchorFilter.user_id = BigInt(user_id);
  }
  if (display_id) {
    anchorFilter.display_id = display_id;
  }
  if (invite_type) {
    filter.invite_type = invite_type;
  }
  if (rank_league) {
    anchorFilter.rank_league = rank_league;
  }
  if (region) {
    anchorFilter.region = region;
  }
  if (has_commerce_goods) {
    anchorFilter.has_commerce_goods = has_commerce_goods;
  }
  if (follower_count) {
    anchorFilter.follower_count = follower_count;
  }
  if (audience_count) {
    anchorFilter.audience_count = audience_count;
  }
  if (current_diamonds) {
    anchorFilter.current_diamonds = current_diamonds;
  }
  if (last_diamonds) {
    anchorFilter.last_diamonds = last_diamonds;
  }
  if (highest_diamonds) {
    anchorFilter.highest_diamonds = highest_diamonds;
  }
  if (Object.keys(anchorFilter).length > 0) {
    filter.anchor = anchorFilter;
  }

  if (updated_at) {
    filter.updated_at = updated_at;
  }

  if (area) {
    filter.area = area;
  }

  if (invite_type) {
    filter.invite_type = invite_type;
  }

  return filter;
}
