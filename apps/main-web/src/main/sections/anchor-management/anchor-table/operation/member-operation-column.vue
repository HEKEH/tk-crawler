<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElTableColumn } from 'element-plus';
import { useGlobalStore } from '../../../../utils';
import { type UseTaskAssignParams, useTaskClaim } from '../hooks';
import { useIsWebSize } from '@tk-crawler/view-shared';

const props = defineProps<{
  refetch: UseTaskAssignParams['refetch'];
}>();

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

const globalStore = useGlobalStore();

const { handleClaimTask, handleCancelClaimTask } = useTaskClaim(props);

const isWeb = useIsWebSize();
</script>

<template>
  <ElTableColumn v-bind="$attrs" label="操作" :min-width="isWeb ? 130 : 110">
    <template #default="scope: ScopeType">
      <div class="operation-buttons">
        <ElButton
          v-if="!scope.row.assigned_user"
          size="small"
          type="primary"
          @click="handleClaimTask([scope.row])"
        >
          认领建联任务
        </ElButton>
        <ElButton
          v-else-if="
            scope.row.assigned_user.id === globalStore.userProfile.userId
          "
          size="small"
          type="danger"
          @click="handleCancelClaimTask([scope.row])"
        >
          重置建联任务
        </ElButton>
      </div>
    </template>
  </ElTableColumn>
</template>
