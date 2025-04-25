<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElTableColumn } from 'element-plus';
import AssignTaskFormDialog from '../assign-task-form-dialog.vue';
import { useTaskAssign, type UseTaskAssignParams } from '../hooks';

const props = defineProps<{
  refetch: UseTaskAssignParams['refetch'];
}>();

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

const {
  assignTaskDialogVisible,
  taskAnchors,
  openAssignTaskDialog,
  onCloseAssignTaskDialog,
  handleSubmitTaskAssign,
  handleCancelAssignTask,
} = useTaskAssign(props);
</script>

<template>
  <ElTableColumn v-bind="$attrs" label="操作" :min-width="180">
    <template #default="scope: ScopeType">
      <div class="operation-buttons">
        <ElButton
          size="small"
          type="primary"
          :disabled="!scope.row.checked_result"
          @click="openAssignTaskDialog([scope.row])"
        >
          {{ scope.row.assigned_user ? '重新分配' : '分配主播' }}
        </ElButton>
        <ElButton
          :disabled="!scope.row.assigned_user"
          size="small"
          type="danger"
          @click="handleCancelAssignTask(scope.row)"
        >
          取消分配
        </ElButton>
      </div>
    </template>
  </ElTableColumn>
  <Teleport to="body">
    <AssignTaskFormDialog
      :visible="assignTaskDialogVisible"
      :anchors="taskAnchors"
      :submit="handleSubmitTaskAssign"
      @close="onCloseAssignTaskDialog"
    />
  </Teleport>
</template>
