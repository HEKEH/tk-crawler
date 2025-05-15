import type {
  Area,
  TKGuildUserListFilter,
  TKGuildUserStatus,
} from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  search: string;
  area: Area | 'all';
  status: TKGuildUserStatus | 'all';
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): TKGuildUserListFilter {
  function transValue<T>(value: T | undefined | 'all'): T | undefined {
    if (value === 'all') {
      return undefined;
    }
    return value;
  }
  return {
    search: filterViewValues.search,
    area: transValue(filterViewValues.area),
    status: transValue(filterViewValues.status),
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  search: '',
  area: 'all',
  status: 'all',
};
