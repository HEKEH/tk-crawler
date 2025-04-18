import type {
  GetOrgMemberListFilter,
  OrgMemberRole,
  OrgMemberStatus,
} from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  username?: string;
  display_name?: string;
  email?: string;
  mobile?: string;
  role_id: OrgMemberRole | 'all';
  status: OrgMemberStatus | 'all';
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): GetOrgMemberListFilter {
  function transValue<T>(value: T | undefined | 'all'): T | undefined {
    if (value === 'all') {
      return undefined;
    }
    return value;
  }
  return {
    username: filterViewValues.username || undefined,
    display_name: filterViewValues.display_name || undefined,
    email: filterViewValues.email || undefined,
    mobile: filterViewValues.mobile || undefined,
    role_id: transValue(filterViewValues.role_id),
    status: transValue(filterViewValues.status),
  };
}

export function getDefaultFilterViewValues(): FilterViewValues {
  return {
    role_id: 'all',
    status: 'all',
  };
}
