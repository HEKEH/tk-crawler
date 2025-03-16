<script setup lang="ts">
import { ElRadio, ElRadioGroup } from 'element-plus';
import { ref } from 'vue';

interface Props {
  value: 'all' | 'filtered';
  filteredRowsTotal: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', type: 'all' | 'filtered'): void;
}>();

const clearType = ref<'all' | 'filtered'>(props.value);

function handleUpdate(val: 'all' | 'filtered') {
  clearType.value = val;
  emit('update', val);
}
</script>

<template>
  <div class="clear-message">
    <p class="dialog-title mb-4">请选择要清空的数据范围：</p>

    <ElRadioGroup
      :model-value="clearType"
      class="radio-group"
      @update:model-value="handleUpdate as any"
    >
      <ElRadio value="all" class="radio-item"> 清空所有数据 </ElRadio>
      <ElRadio value="filtered" class="radio-item">
        {{ `清空筛选结果（共 ${filteredRowsTotal} 条记录）` }}
      </ElRadio>
    </ElRadioGroup>

    <p class="warning-text">
      <i class="el-icon-warning-outline mr-1" />
      此操作不可恢复，请谨慎选择！
    </p>
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
  gap: 12px;
  margin: 16px 0;
  flex-direction: column;
  align-items: flex-start;
}

.radio-item {
  height: 32px;
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
