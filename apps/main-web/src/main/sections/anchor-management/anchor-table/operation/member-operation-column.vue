<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { useIsWeb } from '@tk-crawler/view-shared';
import { ElButton, ElTableColumn } from 'element-plus';
import { useGlobalStore } from '../../../../utils';
import { type UseTaskAssignParams, useTaskClaim } from '../hooks';

const props = defineProps<{
  refetch: UseTaskAssignParams['refetch'];
}>();

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

const isWeb = useIsWeb();

const globalStore = useGlobalStore();

const { handleClaimTask, handleCancelClaimTask } = useTaskClaim(props);
</script>

<template>
  <ElTableColumn
    label="操作"
    :min-width="140"
    :fixed="isWeb ? 'right' : undefined"
  >
    <template #default="scope: ScopeType">
      <div class="operation-buttons">
        <ElButton
          v-if="!scope.row.assigned_user"
          size="small"
          type="primary"
          @click="handleClaimTask([scope.row])"
        >
          认领建联分配
        </ElButton>
        <ElButton
          v-else-if="
            scope.row.assigned_user.id === globalStore.userProfile.userInfo?.id
          "
          size="small"
          type="danger"
          @click="handleCancelClaimTask([scope.row])"
        >
          重置建联分配
        </ElButton>
      </div>
    </template>
  </ElTableColumn>
</template>
