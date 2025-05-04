import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { Column } from 'element-plus';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElButton } from 'element-plus';
import { computed, Teleport } from 'vue';
import AssignTaskFormDialog from '../assign-task-form-dialog.vue';
import { useTaskAssign, type UseTaskAssignParams } from '../hooks';

export function useAdminOperationColumn(props: {
  refetch: UseTaskAssignParams['refetch'];
}) {
  const isWeb = useIsWebSize();

  const {
    assignTaskDialogVisible,
    taskAnchors,
    openAssignTaskDialog,
    onCloseAssignTaskDialog,
    handleSubmitTaskAssign,
    handleCancelAssignTask,
  } = useTaskAssign(props);

  const column = computed<Column<DisplayedAnchorItem>>(() => ({
    key: 'admin-operation',
    title: '操作',
    width: 190,
    fixed: isWeb.value ? ('left' as any) : undefined,
    cellRenderer: ({ rowData }: { rowData: DisplayedAnchorItem }) => (
      <div class="operation-buttons">
        <ElButton
          size="small"
          type="primary"
          disabled={!rowData.checked_result}
          onClick={() => openAssignTaskDialog([rowData])}
        >
          {rowData.assigned_user ? '重新分配' : '分配主播'}
        </ElButton>
        <ElButton
          size="small"
          type="danger"
          disabled={!rowData.assigned_user}
          onClick={() => handleCancelAssignTask(rowData)}
        >
          取消分配
        </ElButton>
      </div>
    ),
  }));

  const dialog = () => (
    <Teleport to="body">
      <AssignTaskFormDialog
        visible={assignTaskDialogVisible.value}
        anchors={taskAnchors.value}
        submit={handleSubmitTaskAssign}
        onClose={onCloseAssignTaskDialog}
      />
    </Teleport>
  );

  return {
    column,
    view: dialog,
  };
}
