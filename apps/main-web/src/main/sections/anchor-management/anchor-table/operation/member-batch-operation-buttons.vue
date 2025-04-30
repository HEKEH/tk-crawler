<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import { ElButton } from 'element-plus';
import { computed } from 'vue';
import { useGlobalStore } from '../../../../utils';
import { type UseTaskAssignParams, useTaskClaim } from '../hooks';

const props = defineProps<{
  refetch: UseTaskAssignParams['refetch'];
  selectedRows: DisplayedAnchorItem[];
}>();

const globalStore = useGlobalStore();
const { handleBatchClaimTask, handleBatchCancelClaim } = useTaskClaim(props);
const anchorsNotAssignedSelected = computed(() =>
  props.selectedRows.filter(item => !item.assigned_user),
);
const anchorsAssignedToSelfSelected = computed(() =>
  props.selectedRows.filter(
    item =>
      item.assigned_user &&
      item.assigned_user.id === globalStore.userProfile.userId,
  ),
);
</script>

<template>
  <ElButton
    type="primary"
    size="small"
    :disabled="!anchorsNotAssignedSelected.length"
    @click="handleBatchClaimTask(anchorsNotAssignedSelected)"
  >
    批量认领
  </ElButton>
  <ElButton
    :disabled="!anchorsAssignedToSelfSelected.length"
    type="danger"
    size="small"
    @click="handleBatchCancelClaim(anchorsAssignedToSelfSelected)"
  >
    批量重置任务
  </ElButton>
</template>
