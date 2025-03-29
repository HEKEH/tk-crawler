import type { TKGuildUserListFilter } from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  search: string;
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): TKGuildUserListFilter {
  return {
    search: filterViewValues.search,
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  search: '',
};
