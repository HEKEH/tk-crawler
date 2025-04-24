<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import { ElButton } from 'element-plus';
import { computed } from 'vue';
import { useAnchorContact, type UseAnchorContactParams } from '../hooks';

const props = defineProps<{
  refetch: UseAnchorContactParams['refetch'];
  selectedRows: DisplayedAnchorItem[];
}>();

const { handleBatchContactAnchor, handleBatchCancelAnchorContact } =
  useAnchorContact(props);
const anchorsNotContactedSelected = computed(() =>
  props.selectedRows.filter(item => !item.contacted_user),
);
const anchorsContactedSelected = computed(() =>
  props.selectedRows.filter(item => item.contacted_user),
);
</script>

<template>
  <ElButton
    type="primary"
    size="small"
    :disabled="!anchorsNotContactedSelected.length"
    @click="handleBatchContactAnchor(anchorsNotContactedSelected)"
  >
    批量完成建联
  </ElButton>
  <ElButton
    :disabled="!anchorsContactedSelected.length"
    type="danger"
    size="small"
    @click="handleBatchCancelAnchorContact(anchorsContactedSelected)"
  >
    批量重置
  </ElButton>
</template>
