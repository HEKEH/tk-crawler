import type { AnchorCommentTemplateGroupListFilter } from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  search: string;
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): AnchorCommentTemplateGroupListFilter {
  return {
    search: filterViewValues.search,
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  search: '',
};
