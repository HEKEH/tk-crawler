<script setup lang="ts">
import { ANCHOR_LIST_QUERY_COUNT_LIMIT } from '@tk-crawler/biz-shared';
import { ElRadio, ElRadioGroup } from 'element-plus';
import { ref } from 'vue';

interface Props {
  value: 'all' | 'filtered' | 'notContacted';
  filteredRowsTotal: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', type: 'all' | 'filtered' | 'notContacted'): void;
}>();

const clearType = ref<'all' | 'filtered' | 'notContacted'>(props.value);

function handleUpdate(val: 'all' | 'filtered' | 'notContacted') {
  clearType.value = val;
  emit('update', val);
}
</script>

<template>
  <div class="clear-message">
    <p class="dialog-title">请选择要清空的数据范围：</p>

    <ElRadioGroup
      :model-value="clearType"
      class="radio-group"
      @update:model-value="handleUpdate as any"
    >
      <ElRadio value="notContacted" class="radio-item">
        清空未建联的主播
      </ElRadio>
      <ElRadio value="filtered" class="radio-item">
        {{
          filteredRowsTotal < ANCHOR_LIST_QUERY_COUNT_LIMIT
            ? `清空筛选结果（共 ${filteredRowsTotal} 条记录）`
            : `清空筛选结果（≥ ${ANCHOR_LIST_QUERY_COUNT_LIMIT} 条记录）`
        }}
      </ElRadio>
      <ElRadio value="all" class="radio-item"> 清空所有数据 </ElRadio>
    </ElRadioGroup>
    <p class="warning-text">此操作不可恢复，请谨慎选择！</p>
  </div>
</template>

<style scoped>
.clear-message {
  padding: 8px 0;
}

.dialog-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.radio-group {
  display: flex;
  margin: 16px 0;
  flex-direction: column;
  align-items: flex-start;
}

.radio-item {
  margin: 0;
}

.warning-text {
  font-size: 13px;
  color: var(--el-color-danger);
  margin-top: 16px;
  display: flex;
  align-items: center;
}
</style>
