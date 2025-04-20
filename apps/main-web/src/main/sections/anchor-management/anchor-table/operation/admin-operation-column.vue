<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElTableColumn } from 'element-plus';
import AssignTaskFormDialog from '../assign-task-form-dialog.vue';
import { useTasks, type UseTasksParams } from '../hooks';

const props = defineProps<{
  refetch: UseTasksParams['refetch'];
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
} = useTasks(props);
</script>

<template>
  <ElTableColumn label="操作" :min-width="180" fixed="right">
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

<!-- <template v-else>
  <ElButton
    v-if="!scope.row.assigned_user"
    size="small"
    type="primary"
    @click="handleClaimTask([scope.row])"
  >
    认领任务
  </ElButton>
  <ElButton
    v-else-if="
      scope.row.assigned_user.id ===
      globalStore.userProfile.userInfo?.id
    "
    size="small"
    type="danger"
    @click="handleCancelClaimTask([scope.row])"
  >
    取消任务
  </ElButton>
</template> -->
