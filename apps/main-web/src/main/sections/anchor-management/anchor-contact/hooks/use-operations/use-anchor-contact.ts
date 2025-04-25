import type { QueryObserverResult } from '@tanstack/vue-query';
import type {
  DisplayedAnchorItem,
  GetAnchorListResponseData,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElMessage, ElMessageBox } from 'element-plus';
import { anchorContacted, cancelAnchorContact } from '../../../../../requests';
import { useGlobalStore } from '../../../../../utils';

export interface UseAnchorContactParams {
  refetch: () => Promise<
    QueryObserverResult<GetAnchorListResponseData | undefined, Error>
  >;
}

export function useAnchorContact(params: UseAnchorContactParams) {
  const globalStore = useGlobalStore();
  async function handleContactAnchor(taskAnchors: DisplayedAnchorItem[]) {
    const result = await anchorContacted(
      {
        ids: taskAnchors.map(item => item.id),
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    ElMessage.success('操作完成');
  }

  async function handleCancelAnchorContact(taskAnchors: DisplayedAnchorItem[]) {
    const result = await cancelAnchorContact(
      {
        ids: taskAnchors.map(item => item.id),
      },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await params.refetch();
    ElMessage.success('操作成功');
  }

  async function handleBatchContactAnchor(anchors: DisplayedAnchorItem[]) {
    const taskAnchors = anchors.filter(item => !item.contacted_user);
    try {
      await ElMessageBox.confirm(
        `确定已完成建联 ${taskAnchors.length} 个主播吗？`,
        {
          type: 'success',
          showCancelButton: true,
        },
      );
    } catch {
      return;
    }
    await handleContactAnchor(taskAnchors);
  }

  async function handleBatchCancelAnchorContact(
    anchors: DisplayedAnchorItem[],
  ) {
    const taskAnchors = anchors.filter(item => item.contacted_user);
    try {
      await ElMessageBox.confirm(
        `确定取消 ${taskAnchors.length} 个建联状态吗？`,
        {
          type: 'warning',
          showCancelButton: true,
        },
      );
    } catch {
      return;
    }
    await handleCancelAnchorContact(taskAnchors);
  }
  return {
    handleContactAnchor,
    handleCancelAnchorContact,
    handleBatchContactAnchor,
    handleBatchCancelAnchorContact,
  };
}
