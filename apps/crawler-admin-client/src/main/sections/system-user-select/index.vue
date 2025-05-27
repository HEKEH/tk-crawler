<script setup lang="ts">
import type { Area, SystemAdminUserRole } from '@tk-crawler/biz-shared';
import { onKeepAliveActivated, useIsWebSize } from '@tk-crawler/view-shared';
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref } from 'vue';
import { useGetAdminUserList } from '../../hooks';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'SystemUserSelect',
});

const props = withDefaults(
  defineProps<{
    modelValue?: SystemUserPropsValue;
    placeholder?: string;
    showAll?: boolean;
    roleId?: SystemAdminUserRole;
  }>(),
  {
    placeholder: '请选择',
    showAll: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
  change: [value: string | undefined];
}>();

type SystemUserPropsValue = string | 'all';

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);
const filter = computed(() => {
  if (props.roleId !== undefined) {
    return {
      role_id: props.roleId,
    };
  }
  return {};
});

const { data, isLoading, refetch } = useGetAdminUserList(
  {
    pageNum: 1,
    pageSize: 1000,
    filter,
  },
  token,
);

const filterText = ref<string>();

function handleFilter(query: string) {
  filterText.value = query;
}

function handleChange(value: Area) {
  emit('change', value);
}

const value = computed<SystemUserPropsValue | undefined>({
  get() {
    return props.modelValue;
  },
  set(newValue: SystemUserPropsValue | undefined) {
    emit('update:modelValue', newValue);
  },
});

const allOptions = computed<
  {
    label: string;
    value: string | 'all';
  }[]
>(() => {
  const list = data.value?.list ?? [];
  const options = list.map(item => ({
    label: item.username,
    value: item.id,
  }));
  if (props.showAll) {
    return [{ label: '全部', value: 'all' }, ...options];
  }
  return options;
});

const showOptions = computed(() => {
  const q = filterText.value?.trim();
  if (!q) {
    return allOptions.value;
  }
  return allOptions.value.filter(item => item.label.includes(q));
});

const isWebSize = useIsWebSize(); // 移动端屏蔽搜索，因为会弹出键盘，影响使用

onKeepAliveActivated(() => {
  refetch();
});
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
    :placeholder="placeholder"
    :filterable="isWebSize"
    :filter-method="handleFilter"
    :reserve-keyword="false"
    :loading="isLoading"
    @change="handleChange"
  >
    <ElOption
      v-for="option in showOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </ElSelect>
</template>
