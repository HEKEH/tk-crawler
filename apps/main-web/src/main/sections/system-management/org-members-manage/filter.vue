<script setup lang="ts">
import type { FilterViewValues } from './filter';
import { Refresh, Search } from '@element-plus/icons-vue';
import { DoubleDownIcon, DoubleUpIcon } from '@tk-crawler/assets';
import { OrgMemberRole, OrgMemberStatus } from '@tk-crawler/biz-shared';
import { useIsMobile } from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
import { debounce } from 'lodash';
import { ref, watch } from 'vue';
import '../../../styles/table-header-filter.scss';

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

const isMobile = useIsMobile();

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
        <label class="filter-label">登录名</label>
        <ElInput
          v-model="filters.username"
          placeholder="登录名"
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
        <label class="filter-label">显示名</label>
        <ElInput
          v-model="filters.display_name"
          placeholder="显示名"
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
        <label class="filter-label">邮箱</label>
        <ElInput
          v-model="filters.email"
          placeholder="邮箱"
          clearable
          size="small"
          @input="debounceHandleFilterChange"
        />
      </div>
      <div class="filter-item">
        <label class="filter-label">手机号</label>
        <ElInput
          v-model="filters.mobile"
          placeholder="手机号"
          clearable
          size="small"
          @input="debounceHandleFilterChange"
        />
      </div>
      <div class="filter-item">
        <label class="filter-label">角色</label>
        <ElSelect
          v-model="filters.role_id"
          size="small"
          @change="handleFilterChange"
        >
          <ElOption value="all" label="全部" />
          <ElOption :value="OrgMemberRole.admin" label="管理员" />
          <ElOption :value="OrgMemberRole.member" label="普通用户" />
        </ElSelect>
      </div>
      <div class="filter-item">
        <label class="filter-label">状态</label>
        <ElSelect
          v-model="filters.status"
          size="small"
          @change="handleFilterChange"
        >
          <ElOption value="all" label="全部" />
          <ElOption :value="OrgMemberStatus.normal" label="正常" />
          <ElOption :value="OrgMemberStatus.disabled" label="禁用" />
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
