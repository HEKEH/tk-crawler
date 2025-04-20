import type { QueryObserverResult } from '@tanstack/vue-query';
import type {
  DisplayedAnchorItem,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';
import { assignTask } from '../../../../../requests';
import { useGlobalStore } from '../../../../../utils';

export interface UseTasksParams {
  refetch: () => Promise<
    QueryObserverResult<GetAnchorListResponseData | undefined, Error>
  >;
}

export function useTasks(params: UseTasksParams) {
  const globalStore = useGlobalStore();
  const assignTaskDialogVisible = ref(false);
  const taskAnchors = ref<DisplayedAnchorItem[]>([]);
  function openAssignTaskDialog(item: DisplayedAnchorItem[]) {
    taskAnchors.value = item;
    assignTaskDialogVisible.value = true;
  }
  function onCloseAssignTaskDialog() {
    assignTaskDialogVisible.value = false;
    taskAnchors.value = [];
  }
  async function handleSubmitTaskAssign(data: { orgMemberId: string }) {
    const result = await assignTask(
      {
        anchor_check_ids: taskAnchors.value.map(item => item.id),
        org_member_id: data.orgMemberId,
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    onCloseAssignTaskDialog();
    ElMessage.success('主播分配成功');
  }
  async function handleCancelAssignTask(data: DisplayedAnchorItem) {
    try {
      await ElMessageBox.confirm(
        `确定取消将「${data.display_id}」分配给「${data.assigned_user!.display_name}」吗？`,
        {
          type: 'warning',
          showCancelButton: true,
        },
      );
    } catch {
      return;
    }
    const result = await assignTask(
      {
        anchor_check_ids: [data.id],
        org_member_id: null,
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    ElMessage.success('主播取消分配成功');
  }
  async function batchCancelAssignTasks(anchors: DisplayedAnchorItem[]) {
    const anchorCheckIds = anchors
      .filter(item => item.assigned_user)
      .map(item => item.id);
    try {
      await ElMessageBox.confirm(
        `确定取消分配 ${anchorCheckIds.length} 个主播吗？`,
        {
          type: 'warning',
          showCancelButton: true,
        },
      );
    } catch {
      return;
    }
    const result = await assignTask(
      {
        anchor_check_ids: anchorCheckIds,
        org_member_id: null,
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    ElMessage.success('主播批量取消分配成功');
  }
  // async function handleClaimTask(taskAnchors: DisplayedAnchorItem[]) {
  //   const result = await claimTask(
  //     {
  //       anchor_check_ids: taskAnchors.map(item => item.id),
  //     },
  //     globalStore.token,
  //   );
  //   if (result.status_code !== RESPONSE_CODE.SUCCESS) {
  //     return;
  //   }
  //   await refetch();
  //   ElMessage.success('认领任务成功');
  // }

  // async function handleCancelClaimTask(taskAnchors: DisplayedAnchorItem[]) {
  //   const result = await cancelClaimTask(
  //     {
  //       anchor_check_ids: taskAnchors.map(item => item.id),
  //     },
  //     globalStore.token,
  //   );
  //   if (result.status_code !== RESPONSE_CODE.SUCCESS) {
  //     return;
  //   }
  //   await refetch();
  //   ElMessage.success('取消任务成功');
  // }

  // async function handleBatchClaimTask() {
  //   const taskAnchors = selectedRows.value.filter(item => !item.assigned_user);
  //   try {
  //     await ElMessageBox.confirm(
  //       `确定认领 ${taskAnchors.length} 个未分配主播吗？`,
  //       {
  //         type: 'success',
  //         showCancelButton: true,
  //       },
  //     );
  //   } catch {
  //     return;
  //   }
  //   await handleClaimTask(taskAnchors);
  // }

  // async function handleBatchCancelClaim() {
  //   const taskAnchors = selectedRows.value.filter(
  //     item => item.assigned_user?.id === globalStore.userProfile.userInfo?.id,
  //   );
  //   try {
  //     await ElMessageBox.confirm(
  //       `确定取消本人的 ${taskAnchors.length} 个任务吗？`,
  //       {
  //         type: 'warning',
  //         showCancelButton: true,
  //       },
  //     );
  //   } catch {
  //     return;
  //   }
  //   await handleCancelClaimTask(taskAnchors);
  // }
  return {
    assignTaskDialogVisible,
    taskAnchors,
    openAssignTaskDialog,
    onCloseAssignTaskDialog,
    handleSubmitTaskAssign,
    handleCancelAssignTask,
    batchCancelAssignTasks,
  };
}
