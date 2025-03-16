import type {
  AnchorFrom87ListFilter,
  AnchorFrom87WhereInput,
} from '@tk-crawler/biz-shared';

export function transformFilterValuesToFilterValues(
  filterValues?: AnchorFrom87ListFilter,
): AnchorFrom87WhereInput {
  const { has_grouped, search, ...filterRest } = filterValues ?? {};
  const filter: AnchorFrom87WhereInput = filterRest;
  if (has_grouped !== undefined) {
    filter.AnchorFollowGroupRelation = has_grouped
      ? {
          some: {}, // 存在任何关联记录
        }
      : {
          none: {}, // 不存在任何关联记录
        };
  }

  if (search) {
    filter.account = {
      contains: search,
    };
  }
  return filter;
}
