<script setup lang="ts">
import { ElRadio, ElRadioGroup } from 'element-plus';
import { ref } from 'vue';

interface state {
  clearScope: 'all' | 'filtered';
  clearOption: 'only-anchor' | 'all';
}

interface Props {
  value: state;
  filteredRowsTotal: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', state: state): void;
}>();

const clearOption = ref<state['clearOption']>(props.value.clearOption);
const clearScope = ref<state['clearScope']>(props.value.clearScope);

function handleClearOptionChange(val: state['clearOption']) {
  clearOption.value = val;
  emit('update', { clearScope: clearScope.value, clearOption: val });
}

function handleClearScopeChange(val: state['clearScope']) {
  clearScope.value = val;
  emit('update', { clearScope: val, clearOption: clearOption.value });
}
</script>

<template>
  <div class="clear-message">
    <p class="dialog-title mb-4">请选择清空范围：</p>

    <div class="radio-groups">
      <ElRadioGroup
        :model-value="clearOption"
        class="radio-group"
        @update:model-value="handleClearOptionChange as any"
      >
        <ElRadio value="only-anchor" class="radio-item">
          仅清空主播，但保留分组
        </ElRadio>
        <ElRadio value="all" class="radio-item"> 清空分组和关联主播 </ElRadio>
      </ElRadioGroup>

      <ElRadioGroup
        :model-value="clearScope"
        class="radio-group"
        @update:model-value="handleClearScopeChange as any"
      >
        <ElRadio value="all" class="radio-item"> 选择所有分组 </ElRadio>
        <ElRadio value="filtered" class="radio-item">
          {{ `仅选择筛选结果（共 ${filteredRowsTotal} 条数据）` }}
        </ElRadio>
      </ElRadioGroup>
    </div>

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
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.radio-groups {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}

.radio-group {
  display: flex;
  flex-direction: row;
  column-gap: 10px;
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
