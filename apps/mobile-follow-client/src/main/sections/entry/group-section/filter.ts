import type { AnchorFollowGroupListFilter } from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  search: string;
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): AnchorFollowGroupListFilter {
  return {
    search: filterViewValues.search,
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  search: '',
};
