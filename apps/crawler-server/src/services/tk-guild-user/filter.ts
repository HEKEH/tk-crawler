import type {
  TKGuildUserListFilter,
  TKGuildUserWhereInput,
} from '@tk-crawler/biz-shared';
import xss from 'xss';

// Transform filter values for TK Guild User
export function transformTKGuildUserFilterValues(
  filterValues: TKGuildUserListFilter | undefined,
  orgId: string,
): TKGuildUserWhereInput {
  const { search, ...restFilter } = filterValues ?? {};
  const filter: TKGuildUserWhereInput = restFilter;
  filter.org_id = BigInt(orgId);

  // Add search condition if provided
  if (search) {
    filter.username = {
      contains: xss(search),
    };
  }

  return filter;
}
