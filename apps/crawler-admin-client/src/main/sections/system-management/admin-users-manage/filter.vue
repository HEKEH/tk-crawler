<script setup lang="ts">
import type { FilterViewValues } from './filter';
import { Refresh, Search } from '@element-plus/icons-vue';
import { DoubleDownIcon, DoubleUpIcon } from '@tk-crawler/assets';
import { ADMIN_USER_ROLE_OPTIONS } from '@tk-crawler/biz-shared';
import { useIsMobileSize } from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
import { debounce } from 'lodash';
import { ref, watch } from 'vue';
import '@tk-crawler/styles/table-header-filter.scss';

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

const debounceHandleFilterChange = debounce(handleFilterChange, 500);

const isMobile = useIsMobileSize();

const isExpanded = ref(false);
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div class="table-header-filter">
    <div
      class="filter-items"
      :class="
        !isMobile
          ? undefined
          : isExpanded
            ? 'filter-items-expanded'
            : 'filter-items-collapsed'
      "
    >
      <div class="filter-item">
        <label class="filter-label">用户名</label>
        <ElInput
          v-model="filters.username"
          placeholder="用户名"
          clearable
          size="small"
          @input="debounceHandleFilterChange"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
      </div>
      <div class="filter-item">
        <label class="filter-label">角色</label>
        <ElSelect
          v-model="filters.role_id"
          size="small"
          @change="handleFilterChange"
        >
          <ElOption value="all" label="全部" />
          <ElOption
            v-for="role in ADMIN_USER_ROLE_OPTIONS"
            :key="role.value"
            :value="role.value"
            :label="role.label"
          />
        </ElSelect>
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
      <ElButton type="default" size="small" @click="toggleExpand">
        <ElIcon style="margin-right: 0.25rem">
          <DoubleDownIcon v-if="!isExpanded" width="16" height="16" />
          <DoubleUpIcon v-else width="16" height="16" />
        </ElIcon>
        {{ isExpanded ? '收起' : '展开' }}
      </ElButton>
    </div>
  </div>
</template>
