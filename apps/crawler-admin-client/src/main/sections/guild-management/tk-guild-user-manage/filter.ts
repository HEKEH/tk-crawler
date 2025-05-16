import type { Area, TKGuildUserListFilter } from '@tk-crawler/biz-shared';
import { TKGuildUserStatus } from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  search: string;
  area: Area | 'all';
  status: TKGuildUserStatus[] | 'all';
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
  let status: { in: TKGuildUserStatus[] } | undefined;
  if (filterViewValues.status !== 'all') {
    status = {
      in: filterViewValues.status,
    };
  }
  return {
    search: filterViewValues.search,
    area: transValue(filterViewValues.area),
    status,
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  search: '',
  area: 'all',
  status: [TKGuildUserStatus.COOKIE_EXPIRED, TKGuildUserStatus.ERROR],
};
