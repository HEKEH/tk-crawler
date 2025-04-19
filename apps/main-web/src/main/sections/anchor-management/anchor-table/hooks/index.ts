import type { ComputedRef } from 'vue';
import type { FilterViewValues } from '../filter';
import { computed } from 'vue';
import { useGlobalStore } from '../../../../utils';

export * from './use-anchor-table-adapter';

export function useDefaultFilterViewValues(): ComputedRef<FilterViewValues> {
  const globalStore = useGlobalStore();
  const isAdmin = computed(() => globalStore.userProfile.isAdmin);
  const defaultArea = computed(() => globalStore.userProfile.orgInfo?.areas[0]);
  const commonDefaultFilters = computed<Omit<FilterViewValues, 'assign_to'>>(
    () => ({
      area: defaultArea.value,
      invite_type: 'all',
      region: 'all',
      has_commerce_goods: 'all',
      rank_league: [undefined, undefined],
      follower_count: [undefined, undefined],
      current_diamonds: [undefined, undefined],
      last_diamonds: [undefined, undefined],
      highest_diamonds: [undefined, undefined],
      audience_count: [undefined, undefined],
      checked_at: [undefined, undefined],
      checked_result: true,
    }),
  );
  if (!isAdmin.value) {
    return computed<FilterViewValues>(() => {
      return {
        ...commonDefaultFilters.value,
        assign_to: globalStore.userProfile.userInfo?.id,
      };
    });
  }
  return computed<FilterViewValues>(() => {
    return {
      ...commonDefaultFilters.value,
      assign_to: 'all',
    };
  });
}
