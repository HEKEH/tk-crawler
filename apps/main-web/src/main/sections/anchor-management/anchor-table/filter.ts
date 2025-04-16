import type { GetAnchorListFilter } from '@tk-crawler/biz-shared';

export interface FilterViewValues {}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): GetAnchorListFilter {
  return filterViewValues;
}

export const DefaultFilterViewValues: FilterViewValues = {};
