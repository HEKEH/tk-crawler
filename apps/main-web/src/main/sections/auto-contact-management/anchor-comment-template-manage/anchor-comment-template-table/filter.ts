import type { AnchorCommentTemplateListFilter } from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  search: string;
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): AnchorCommentTemplateListFilter {
  return {
    search: filterViewValues.search,
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  search: '',
};
