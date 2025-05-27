<script setup lang="ts">
import type { FilterViewValues } from './filter';
import { Refresh } from '@element-plus/icons-vue';

import {
  OrganizationStatus,
  SystemAdminUserRole,
} from '@tk-crawler/biz-shared';

import { useIsMobileSize } from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElOption, ElSelect } from 'element-plus';
import { ref, watch } from 'vue';
import { useGlobalStore } from '../../../utils';
import SystemUserSelect from '../../system-user-select/index.vue';
import '@tk-crawler/styles/table-header-filter.scss';

const props = defineProps<{
  modelValue: FilterViewValues;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterViewValues];
  change: [value: FilterViewValues];
  reset: [];
}>();

const globalStore = useGlobalStore();

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

const StatusOptions = [
  { value: 'all', label: '全部' },
  { value: OrganizationStatus.normal, label: '正常' },
  { value: OrganizationStatus.disabled, label: '禁用' },
];

const IfMembershipValidOptions = [
  { value: 'all', label: '全部' },
  { value: true, label: '是' },
  { value: false, label: '否' },
];

const isMobile = useIsMobileSize();
</script>

<template>
  <div class="table-header-filter">
    <div class="filter-items">
      <div class="filter-item">
        <label class="filter-label">状态</label>
        <ElSelect
          v-model="filters.status"
          size="small"
          placeholder="请选择"
          @change="handleFilterChange"
        >
          <ElOption
            v-for="item in StatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </div>
      <div class="filter-item">
        <label class="filter-label">会员是否有效</label>
        <ElSelect
          v-model="filters.if_membership_valid"
          size="small"
          placeholder="请选择"
          @change="handleFilterChange"
        >
          <ElOption
            v-for="item in IfMembershipValidOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </div>
      <div v-if="globalStore.userProfile?.isAdmin" class="filter-item">
        <label class="filter-label">经销商</label>
        <SystemUserSelect
          v-model="filters.owner_id"
          size="small"
          show-all
          :role-id="SystemAdminUserRole.DEALER"
          placeholder="请选择"
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
    </div>
  </div>
</template>
