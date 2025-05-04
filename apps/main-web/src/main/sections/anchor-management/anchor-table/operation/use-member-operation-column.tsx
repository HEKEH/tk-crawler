import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { Column } from 'element-plus';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElButton } from 'element-plus';
import { computed } from 'vue';
import { useGlobalStore } from '../../../../utils';
import { type UseTaskAssignParams, useTaskClaim } from '../hooks';

export function useMemberOperationColumn(props: {
  refetch: UseTaskAssignParams['refetch'];
}) {
  const globalStore = useGlobalStore();
  const isWeb = useIsWebSize();

  const { handleClaimTask, handleCancelClaimTask } = useTaskClaim(props);

  const column = computed<Column<DisplayedAnchorItem>>(() => ({
    key: 'member-operation',
    title: '操作',
    width: isWeb.value ? 130 : 110,
    fixed: isWeb.value ? ('left' as any) : undefined,
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
