import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { VirtualizedTableColumn } from '@tk-crawler/view-shared';
import type { ComputedRef } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import type { UseTaskAssignParams } from '../hooks';
import { computed } from 'vue';
import { useGlobalStore } from '../../../../utils';
import { useAdminOperationColumn } from './use-admin-operation-column';
import { useMemberOperationColumn } from './use-member-operation-column';

export function useOperationColumn(props: {
  refetch: UseTaskAssignParams['refetch'];
}): ComputedRef<{
  column: ComputedRef<VirtualizedTableColumn<DisplayedAnchorItem>>;
  view?: () => JSX.Element;
}> {
  const globalStore = useGlobalStore();

  return computed(() => {
    const isAdmin = globalStore.userProfile.isAdmin;
    if (isAdmin) {
      return useAdminOperationColumn(props);
    }
    return useMemberOperationColumn(props);
  });
}
