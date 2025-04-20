<script setup lang="ts">
import type { Area } from '@tk-crawler/biz-shared';
import type { FilterViewValues } from './filter';
import { Search } from '@element-plus/icons-vue';
import { AREA_OPTIONS, TKGuildUserStatusList } from '@tk-crawler/biz-shared';
import { AreaSelectSingle } from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
import { debounce } from 'lodash';
import { computed, ref, watch } from 'vue';
import { getStatusText } from './utils';

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
</script>

<template>
  <div class="filter">
    <div class="filter-items">
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
            v-for="status in TKGuildUserStatusList"
            :key="status"
            :label="getStatusText(status)"
            :value="status"
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
    </div>

    <div class="buttons">
      <ElButton text type="primary" size="small" @click="resetFilters">
        搜索重置
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.filter {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 200px;
}

.filter-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.filter-items {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.buttons {
  margin-left: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;

  :global(.el-button) {
    font-size: 13px;
  }
}
</style>
