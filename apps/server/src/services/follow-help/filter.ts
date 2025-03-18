import type {
  AnchorFollowGroupListFilter,
  AnchorFollowGroupWhereInput,
  AnchorFrom87ListFilter,
  AnchorFrom87WhereInput,
} from '@tk-crawler/biz-shared';
import { xss } from '@tk-crawler/shared';

export function transformAnchorFilterValuesToFilterValues(
  filterValues: AnchorFrom87ListFilter | undefined,
  orgId: string,
): AnchorFrom87WhereInput {
  const { has_grouped, search, ...filterRest } = filterValues ?? {};
  const filter: AnchorFrom87WhereInput = filterRest;
  filter.org_id = BigInt(orgId);
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
      contains: xss(search),
    };
  }
  return filter;
}

export function transformGroupFilterValuesToFilterValues(
  filterValues: AnchorFollowGroupListFilter | undefined,
  orgId: string,
): AnchorFollowGroupWhereInput {
  const { search, ...filterRest } = filterValues ?? {};
  const filter: AnchorFollowGroupWhereInput = filterRest;
  filter.org_id = BigInt(orgId);

  if (search) {
    filter.name = {
      contains: search,
    };
  }
  return filter;
}
