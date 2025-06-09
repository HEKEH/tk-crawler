import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { VirtualizedTableColumn } from '@tk-crawler/view-shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElButton } from 'element-plus';
import { computed } from 'vue';
import { useGlobalStore } from '../../../../utils';
import { useTaskClaim } from '../hooks';

export function useMemberOperationColumn() {
  const globalStore = useGlobalStore();
  const isWeb = useIsWebSize();

  const { handleClaimTask, handleCancelClaimTask } = useTaskClaim();

  const column = computed<VirtualizedTableColumn<DisplayedAnchorItem>>(() => ({
    key: 'member-operation',
    title: '操作',
    width: isWeb.value ? 130 : 110,
    fixed: isWeb.value ? 'left' : undefined,
    cellRenderer: ({ rowData }: { rowData: DisplayedAnchorItem }) => (
      <div class="operation-buttons">
        {!rowData.assigned_user ? (
          <ElButton
            size="small"
            type="primary"
            onClick={() => handleClaimTask([rowData])}
          >
            认领建联任务
          </ElButton>
        ) : rowData.assigned_user.id === globalStore.userProfile.userId ? (
          <ElButton
            size="small"
            type="danger"
            onClick={() => handleCancelClaimTask([rowData])}
          >
            重置建联任务
          </ElButton>
        ) : null}
      </div>
    ),
  }));

  return {
    column,
  };
}
