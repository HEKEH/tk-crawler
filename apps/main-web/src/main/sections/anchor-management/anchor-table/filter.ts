import type {
  AnchorRankLeague,
  Area,
  CanUseInvitationType,
  GetAnchorListFilter,
  Region,
} from '@tk-crawler/biz-shared';
import {
  type RangeViewFilter,
  transformRangeViewFilterToRangeFilter,
} from '@tk-crawler/shared';

export interface FilterViewValues {
  display_id?: string;
  user_id?: string;
  invite_type?: CanUseInvitationType | 'all';
  rank_league: RangeViewFilter<AnchorRankLeague>;
  area?: Area | 'all';
  region?: Region | 'all';
  checked_result?: boolean | 'all';
  has_commerce_goods?: boolean | 'all';
  tag?: string;
  follower_count: RangeViewFilter;
  current_diamonds: RangeViewFilter;
  last_diamonds: RangeViewFilter;
  highest_diamonds: RangeViewFilter;
  audience_count: RangeViewFilter;
  crawled_at: RangeViewFilter<Date>;
  // checked_at: RangeViewFilter<Date>;
  assign_to?: string | 'all' | 'not_assigned' | 'assigned';
  contacted_by?: string | 'all' | 'not_contacted' | 'contacted';
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): GetAnchorListFilter {
  function transValue<T>(value: T | undefined | 'all'): T | undefined {
    if (value === 'all') {
      return undefined;
    }
    return value;
  }
  return {
    display_id: filterViewValues.display_id,
    user_id: filterViewValues.user_id,
    invite_type: transValue(filterViewValues.invite_type),
    rank_league: transformRangeViewFilterToRangeFilter(
      filterViewValues.rank_league,
    ),
    area: transValue(filterViewValues.area),
    region: transValue(filterViewValues.region),
    checked_result: transValue(filterViewValues.checked_result),
    has_commerce_goods: transValue(filterViewValues.has_commerce_goods),
    follower_count: transformRangeViewFilterToRangeFilter(
      filterViewValues.follower_count,
    ),
    current_diamonds: transformRangeViewFilterToRangeFilter(
      filterViewValues.current_diamonds,
    ),
    last_diamonds: transformRangeViewFilterToRangeFilter(
      filterViewValues.last_diamonds,
    ),
    highest_diamonds: transformRangeViewFilterToRangeFilter(
      filterViewValues.highest_diamonds,
    ),
    audience_count: transformRangeViewFilterToRangeFilter(
      filterViewValues.audience_count,
    ),
    // checked_at: transformRangeViewFilterToRangeFilter(
    //   filterViewValues.checked_at,
    // ),
    crawled_at: transformRangeViewFilterToRangeFilter(
      filterViewValues.crawled_at,
    ),
    tag: filterViewValues.tag,
    assign_to: transValue(filterViewValues.assign_to),
    contacted_by: transValue(filterViewValues.contacted_by),
  };
}

export function getCommonDefaultFilterViewValues(): FilterViewValues {
  return {
    invite_type: 'all',
    region: 'all',
    has_commerce_goods: 'all',
    rank_league: [undefined, undefined],
    follower_count: [undefined, undefined],
    current_diamonds: [undefined, undefined],
    last_diamonds: [undefined, undefined],
    highest_diamonds: [undefined, undefined],
    audience_count: [undefined, undefined],
    // checked_at: [undefined, undefined],
    crawled_at: [undefined, undefined],
    checked_result: true,
  };
}
