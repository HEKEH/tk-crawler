<script setup lang="ts">
import type { Area } from '@tk-crawler/biz-shared';
import type { FilterViewValues } from './filter';
import { Refresh, Search } from '@element-plus/icons-vue';
import { DoubleDownIcon, DoubleUpIcon } from '@tk-crawler/assets';

import { AREA_OPTIONS, TKGuildUserStatusOptions } from '@tk-crawler/biz-shared';
import { AreaSelectSingle, useIsMobileSize } from '@tk-crawler/view-shared';

import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
import { debounce } from 'lodash';
import { computed, ref, watch } from 'vue';
import '@tk-crawler/styles/table-header-filter.scss';

const props = defineProps<{
  modelValue: FilterViewValues;
  areas: Area[];
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

const areaOptions = computed(() => {
  const areaSet = new Set(props.areas);
  return AREA_OPTIONS.filter(area => areaSet.has(area.value));
});

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
        <label class="filter-label">搜索账号</label>
        <ElInput
          v-model="filters.search"
          placeholder="搜索账号"
          clearable
          size="small"
          @input="debounceSearchChange"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
      </div>
      <div class="filter-item">
        <label class="filter-label">状态</label>
        <ElSelect
          v-model="filters.status"
          size="small"
          @change="handleFilterChange"
        >
          <ElOption label="全部" value="all" />
          <ElOption
            v-for="item in TKGuildUserStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </div>
      <div class="filter-item">
        <label class="filter-label">分区</label>
        <AreaSelectSingle
          v-model="filters.area"
          :options="areaOptions"
          show-all
          size="small"
          @change="handleFilterChange"
        />
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
