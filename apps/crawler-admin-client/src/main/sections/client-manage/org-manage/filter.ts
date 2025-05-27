import type {
  GetOrgListFilter,
  OrganizationStatus,
} from '@tk-crawler/biz-shared';

export interface FilterViewValues {
  owner_id: string | 'all';
  status: OrganizationStatus | 'all';
  if_membership_valid: boolean | 'all';
}

export function transformFilterViewValuesToFilterValues(
  filterViewValues: FilterViewValues,
): GetOrgListFilter {
  function transValue<T>(value: T | undefined | 'all'): T | undefined {
    if (value === 'all') {
      return undefined;
    }
    return value;
  }
  return {
    owner_id: transValue(filterViewValues.owner_id),
    status: transValue(filterViewValues.status),
    if_membership_valid: transValue(filterViewValues.if_membership_valid),
  };
}

export const DefaultFilterViewValues: FilterViewValues = {
  owner_id: 'all',
  status: 'all',
  if_membership_valid: 'all',
};
