import type {
  TKGuildUserListFilter,
  TKGuildUserWhereInput,
} from '@tk-crawler/biz-shared';
import xss from 'xss';

// Transform filter values for TK Guild User
export function transformTKGuildUserFilterValues(
  filterValues: TKGuildUserListFilter | undefined,
  orgId?: string,
): TKGuildUserWhereInput {
  const { search, has_membership, ...restFilter } = filterValues ?? {};
  const filter: TKGuildUserWhereInput = restFilter;
  if (orgId) {
    filter.org_id = BigInt(orgId);
  }

  // Add search condition if provided
  if (search) {
    filter.username = {
      contains: xss(search),
    };
  }

  if (has_membership) {
    if (!filter.organization) {
      filter.organization = {};
    }
    filter.organization.membership_expire_at = {
      gt: new Date(),
    };
  }

  return filter;
}
