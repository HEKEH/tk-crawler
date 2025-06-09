import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { VirtualizedTableColumn } from '@tk-crawler/view-shared';
import type { ComputedRef, Ref } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import type { UseTaskAssignParams } from '../hooks';
import { ref, watch } from 'vue';
import { useGlobalStore } from '../../../../utils';
import { useAdminOperationColumn } from './use-admin-operation-column';
import { useMemberOperationColumn } from './use-member-operation-column';

interface OperationColumnResult {
  column: ComputedRef<VirtualizedTableColumn<DisplayedAnchorItem>>;
  view?: () => JSX.Element;
}

export function useOperationColumn(props: {
  refetch: UseTaskAssignParams['refetch'];
}): Ref<{
  column: VirtualizedTableColumn<DisplayedAnchorItem>;
  view?: () => JSX.Element;
}> {
  const globalStore = useGlobalStore();

  function getResult(): OperationColumnResult {
    if (globalStore.userProfile.isAdmin) {
      return useAdminOperationColumn(props);
    }
    return useMemberOperationColumn(props);
  }

  const result = ref<OperationColumnResult>(getResult());

  watch(
    () => globalStore.userProfile.isAdmin,
    () => {
      result.value = getResult();
    },
  );

  return result;
}
