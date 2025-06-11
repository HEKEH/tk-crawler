import type { QueryObserverResult } from '@tanstack/vue-query';
import {
  type DisplayedAnchorItem,
  type GetAnchorListResponseData,
  OrgMemberStatus,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';
import { useGetOrgMemberList } from '../../../../../hooks';
import { assignTask } from '../../../../../requests';
import { useGlobalStore } from '../../../../../utils';

export interface UseTaskAssignParams {
  refetch: () => Promise<
    QueryObserverResult<GetAnchorListResponseData | undefined, Error>
  >;
}

export function useTaskAssign(params: UseTaskAssignParams) {
  const globalStore = useGlobalStore();
  const assignTaskDialogVisible = ref(false);
  const taskAnchors = ref<DisplayedAnchorItem[]>([]);
  const token = computed(() => globalStore.token);
  const { data: orgMembers } = useGetOrgMemberList(
    {
      pageNum: 1,
      pageSize: 1000,
      filter: {
        status: OrgMemberStatus.normal,
      },
    },
    token,
  );
  function openAssignTaskDialog(items: DisplayedAnchorItem[]) {
    taskAnchors.value = items;
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
    if (taskAnchors.value.length <= 1) {
      // 单个分配的时候，直接更新本地数据
      taskAnchors.value.forEach(item => {
        item.assigned_user = orgMembers.value?.list.find(
          member => member.id === data.orgMemberId,
        );
      });
      onCloseAssignTaskDialog();
    } else {
      onCloseAssignTaskDialog();
      // 批量分配的话，刷新数据
      await params.refetch();
    }
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
    data.assigned_user = null;
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
    ElMessage.success('批量重置分配成功');
  }
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
