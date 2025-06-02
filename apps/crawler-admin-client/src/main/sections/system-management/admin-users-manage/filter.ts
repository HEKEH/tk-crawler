import type {
  GetSystemAdminUserListFilter,
  SystemAdminUserRole,
  SystemAdminUserStatus,
} from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  username?: string;
  status: SystemAdminUserStatus | 'all';
  role_id: SystemAdminUserRole | 'all';
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): GetSystemAdminUserListFilter {
  function transValue<T>(value: T | undefined | 'all'): T | undefined {
    if (value === 'all') {
      return undefined;
    }
    return value;
  }
  return {
    username: filterViewValues.username || undefined,
    role_id: transValue(filterViewValues.role_id),
    status: transValue(filterViewValues.status),
  };
}

export function getDefaultFilterViewValues(): FilterViewValues {
  return {
    status: 'all',
    role_id: 'all',
  };
}
