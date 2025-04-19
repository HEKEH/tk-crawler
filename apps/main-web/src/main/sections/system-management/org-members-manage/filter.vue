<script setup lang="ts">
import type { FilterViewValues } from './filter';
import { Search } from '@element-plus/icons-vue';
import { OrgMemberRole, OrgMemberStatus } from '@tk-crawler/biz-shared';
import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
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

const debounceHandleFilterChange = debounce(handleFilterChange, 500);
</script>

<template>
  <div class="filter">
    <div class="filter-items">
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
          <ElOption :value="OrgMemberRole.member" label="成员" />
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
    </div>

    <div class="buttons">
      <ElButton text type="primary" size="small" @click="resetFilters">
        重置
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
