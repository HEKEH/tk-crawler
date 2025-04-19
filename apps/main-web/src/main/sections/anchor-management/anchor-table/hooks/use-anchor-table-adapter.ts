import type { GetAnchorListFilter } from '@tk-crawler/biz-shared';
import type { ComputedRef, Ref } from 'vue';
import type {
  FilterViewValues } from '../filter';
import { computed } from 'vue';
import { useGlobalStore } from '../../../../utils';
import {
  transformFilterViewValuesToFilterValues,
} from '../filter';

export interface UseAnchorTableParams {
  filters: Ref<FilterViewValues>;
}

export interface UseAnchorTableResult {
  queryFilter: ComputedRef<GetAnchorListFilter>;
  hiddenFilters?: string[];
}

export function useAnchorTableAdapter(
  params: UseAnchorTableParams,
): UseAnchorTableResult {
  const globalStore = useGlobalStore();
  const isAdmin = computed(() => globalStore.userProfile.isAdmin);
  if (!isAdmin.value) {
    const queryFilter = computed(() => {
      return {
        ...transformFilterViewValuesToFilterValues(params.filters.value),
        assign_to: globalStore.userProfile.userInfo?.id,
      };
    });
    return {
      queryFilter,
      hiddenFilters: ['assign_to', 'checked_result'], // 隐藏分配状态和可邀约两个filter
    };
  }
  return {
    queryFilter: computed(() => {
      return transformFilterViewValuesToFilterValues(params.filters.value);
    }),
  };
}
