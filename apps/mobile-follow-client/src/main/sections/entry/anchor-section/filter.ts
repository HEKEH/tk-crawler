import type { GetAnchorFrom87ListFilter } from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  has_grouped: boolean | 'all';
  search: string;
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): GetAnchorFrom87ListFilter {
  return {
    has_grouped:
      filterViewValues.has_grouped === 'all'
        ? undefined
        : filterViewValues.has_grouped,
    search: filterViewValues.search,
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  has_grouped: false,
  search: '',
};
