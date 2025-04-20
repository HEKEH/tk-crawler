<script setup lang="ts">
import type {
  DisplayedAnchorItem,
  GetAnchorListFilter,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ClearMessage, confirmAfterSeconds } from '@tk-crawler/view-shared';
import { ElButton, ElMessage } from 'element-plus';
import { h, reactive } from 'vue';
import { clearAnchorCheck } from '../../../../requests';
import { useGlobalStore } from '../../../../utils';
import AssignTaskFormDialog from '../assign-task-form-dialog.vue';
import { useTasks, type UseTasksParams } from '../hooks';

const props = defineProps<{
  queryFilter: GetAnchorListFilter | undefined;
  refetch: UseTasksParams['refetch'];
  data: GetAnchorListResponseData | undefined;
  selectedRows: DisplayedAnchorItem[];
}>();

const globalStore = useGlobalStore();
const {
  assignTaskDialogVisible,
  taskAnchors,
  openAssignTaskDialog,
  onCloseAssignTaskDialog,
  handleSubmitTaskAssign,
  batchCancelAssignTasks,
} = useTasks(props);

async function handleClearAnchorCheck() {
  const state = reactive({
    clearType: 'all' as 'all' | 'filtered',
  });

  try {
    await confirmAfterSeconds(
      h(ClearMessage, {
        value: state.clearType,
        filteredRowsTotal: props.data?.total || 0,
        onUpdate: val => {
          state.clearType = val as 'all' | 'filtered';
        },
      }),
      2,
      {
        title: '一键清空',
        type: undefined,
        showCancelButton: true,
      },
    );

    const resp = await clearAnchorCheck(globalStore.token, {
      filter: state.clearType === 'all' ? undefined : props.queryFilter,
    });

    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message: `共清空 ${resp.data!.deleted_count} 条数据`,
      type: 'success',
      duration: 2000,
    });

    await props.refetch();
  } catch {}
}
</script>

<template>
  <ElButton
    :disabled="!props.selectedRows.filter(item => item.checked_result).length"
    type="primary"
    size="small"
    @click="
      openAssignTaskDialog(selectedRows.filter(item => item.checked_result))
    "
  >
    批量分配
  </ElButton>
  <ElButton
    :disabled="!selectedRows.filter(item => item.assigned_user).length"
    type="danger"
    size="small"
    @click="
      batchCancelAssignTasks(selectedRows.filter(item => item.assigned_user))
    "
  >
    批量取消分配
  </ElButton>
  <ElButton type="danger" size="small" @click="handleClearAnchorCheck">
    一键清空
  </ElButton>
  <AssignTaskFormDialog
    :visible="assignTaskDialogVisible"
    :anchors="taskAnchors"
    :submit="handleSubmitTaskAssign"
    @close="onCloseAssignTaskDialog"
  />
</template>

<!-- <template v-else>
  <ElButton
    type="primary"
    size="small"
    :disabled="
      !selectedRows.filter(item => !item.assigned_user).length
    "
    @click="handleBatchClaimTask"
  >
    批量认领任务
  </ElButton>
  <ElButton
    :disabled="
      !selectedRows.filter(
        item =>
          item.assigned_user?.id ===
          globalStore.userProfile.userInfo?.id,
      ).length
    "
    type="danger"
    size="small"
    @click="handleBatchCancelClaim"
  >
    批量取消任务
  </ElButton>
</template> -->
