import type { QueryObserverResult } from '@tanstack/vue-query';
import type {
  DisplayedAnchorItem,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cancelClaimTask, claimTask } from '../../../../../requests';
import { useGlobalStore } from '../../../../../utils';

export interface UseTaskClaimParams {
  refetch: () => Promise<
    QueryObserverResult<GetAnchorListResponseData | undefined, Error>
  >;
}

export function useTaskClaim(params: UseTaskClaimParams) {
  const globalStore = useGlobalStore();
  async function handleClaimTask(taskAnchors: DisplayedAnchorItem[]) {
    const result = await claimTask(
      {
        anchor_check_ids: taskAnchors.map(item => item.id),
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    ElMessage.success('认领分配成功');
  }

  async function handleCancelClaimTask(taskAnchors: DisplayedAnchorItem[]) {
    const result = await cancelClaimTask(
      {
        anchor_check_ids: taskAnchors.map(item => item.id),
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    ElMessage.success('取消任务成功');
  }

  async function handleBatchClaimTask(anchors: DisplayedAnchorItem[]) {
    const taskAnchors = anchors.filter(item => !item.assigned_user);
    try {
      await ElMessageBox.confirm(
        `确定认领 ${taskAnchors.length} 个未分配主播的建联任务吗？`,
        {
          type: 'success',
          showCancelButton: true,
        },
      );
    } catch {
      return;
    }
    await handleClaimTask(taskAnchors);
  }

  async function handleBatchCancelClaim(anchors: DisplayedAnchorItem[]) {
    const taskAnchors = anchors.filter(
      item => item.assigned_user?.id === globalStore.userProfile.userId,
    );
    try {
      await ElMessageBox.confirm(
        `确定取消本人的 ${taskAnchors.length} 个任务吗？`,
        {
          type: 'warning',
          showCancelButton: true,
        },
      );
    } catch {
      return;
    }
    await handleCancelClaimTask(taskAnchors);
  }
  return {
    handleClaimTask,
    handleCancelClaimTask,
    handleBatchClaimTask,
    handleBatchCancelClaim,
  };
}
