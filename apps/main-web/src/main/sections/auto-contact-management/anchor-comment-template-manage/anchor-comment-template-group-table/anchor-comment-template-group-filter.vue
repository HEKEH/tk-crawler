<script setup lang="ts">
import type { FilterViewValues } from './filter';
import { Refresh, Search } from '@element-plus/icons-vue';
import { useIsMobileSize } from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElInput } from 'element-plus';
import { debounce } from 'lodash';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: FilterViewValues;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterViewValues];
  change: [value: FilterViewValues];
  reset: [];
}>();

const filters = ref<FilterViewValues>({
  ...props.modelValue,
});

// 监听 props 变化
watch(
  () => props.modelValue,
  newVal => {
    filters.value = { ...newVal };
  },
  { deep: true },
);

// 处理过滤器变化
function handleFilterChange() {
  emit('update:modelValue', { ...filters.value });
  emit('change', { ...filters.value });
}

// 重置过滤器
function resetFilters() {
  emit('reset');
}

function handleSearchChange() {
  handleFilterChange();
}
const debounceSearchChange = debounce(handleSearchChange, 500);
const isMobile = useIsMobileSize();
</script>

<template>
  <div class="table-header-filter">
    <div class="filter-items">
      <!-- <div class="filter-item">
        <label class="filter-label">是否已分组</label>
        <ElSelect
          v-model="filters.has_grouped"
          placeholder="分组状态"
          size="small"
          @change="handleFilterChange"
        >
          <ElOption value="all" label="全部" />
          <ElOption :value="true" label="已分组" />
          <ElOption :value="false" label="未分组" />
        </ElSelect>
      </div> -->
      <div class="filter-item">
        <label class="filter-label">搜索名称</label>
        <ElInput
          v-model="filters.search"
          placeholder="搜索名称"
          clearable
          size="small"
          @input="debounceSearchChange"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
      </div>

      <div v-if="!isMobile" class="filter-item-buttons">
        <ElButton type="default" size="small" @click="resetFilters">
          <ElIcon style="margin-right: 0.25rem">
            <Refresh />
          </ElIcon>
          搜索重置
        </ElButton>
      </div>
    </div>
    <div v-if="isMobile" class="buttons">
      <ElButton type="default" size="small" @click="resetFilters">
        <ElIcon style="margin-right: 0.25rem">
          <Refresh />
        </ElIcon>
        搜索重置
      </ElButton>
      <slot name="extra-buttons" />
    </div>
  </div>
</template>
