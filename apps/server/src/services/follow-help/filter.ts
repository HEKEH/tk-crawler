import type {
  AnchorCommentTemplateGroupListFilter,
  AnchorCommentTemplateGroupWhereInput,
  AnchorCommentTemplateListFilter,
  AnchorCommentTemplateWhereInput,
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
    filter.group_id = has_grouped
      ? {
          not: null,
        }
      : {
          equals: null,
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

export function transformTemplateGroupFilterValues(
  filter: AnchorCommentTemplateGroupListFilter | undefined,
  orgId: string,
): AnchorCommentTemplateGroupWhereInput {
  const { search, ...rest } = filter ?? {};
  const result: AnchorCommentTemplateGroupWhereInput = {
    ...rest,
    org_id: BigInt(orgId),
  };

  // 添加搜索条件
  if (search) {
    result.name = {
      contains: search,
    };
  }

  return result;
}

export function transformTemplateFilterValues(
  filter: AnchorCommentTemplateListFilter | undefined,
  orgId: string,
): AnchorCommentTemplateWhereInput {
  const { search, ...rest } = filter ?? {};
  const result: AnchorCommentTemplateWhereInput = {
    ...rest,
    org_id: BigInt(orgId),
  };

  // 添加搜索条件
  if (search) {
    result.OR = [
      {
        content: {
          contains: search,
        },
      },
      {
        label: {
          contains: search,
        },
      },
    ];
  }

  return result;
}
