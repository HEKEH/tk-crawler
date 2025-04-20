<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElTableColumn } from 'element-plus';
import { useAnchorContact, type UseAnchorContactParams } from '../hooks';

const props = defineProps<{
  refetch: UseAnchorContactParams['refetch'];
}>();

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

const { handleContactAnchor, handleCancelAnchorContact } =
  useAnchorContact(props);
</script>

<template>
  <ElTableColumn label="操作" :min-width="140" fixed="right">
    <template #default="scope: ScopeType">
      <div class="operation-buttons">
        <ElButton
          v-if="scope.row.assigned_user && !scope.row.contacted_user"
          size="small"
          type="primary"
          @click="handleContactAnchor([scope.row])"
        >
          完成建联
        </ElButton>
        <ElButton
          v-else-if="scope.row.contacted_user"
          size="small"
          type="danger"
          @click="handleCancelAnchorContact([scope.row])"
        >
          重置建联
        </ElButton>
      </div>
    </template>
  </ElTableColumn>
</template>
