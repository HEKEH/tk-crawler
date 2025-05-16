<script setup lang="ts">
import {
  type TKGuildUserStatus,
  TKGuildUserStatusOptions,
} from '@tk-crawler/biz-shared';
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref } from 'vue';
import { useIsWebSize } from '../hooks';

type GuildUserStatusPropsValue = TKGuildUserStatus[] | 'all';
type SelectValue = (TKGuildUserStatus | 'all')[];

defineOptions({
  name: 'GuildUserStatusSelectMultiple',
});

const props = withDefaults(
  defineProps<{
    modelValue?: GuildUserStatusPropsValue;
    placeholder?: string;
    showAll?: boolean;
    options?: {
      label: string;
      value: TKGuildUserStatus;
    }[];
  }>(),
  {
    placeholder: '请选择区域，可多选',
    showAll: false,
    options: () => TKGuildUserStatusOptions,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: GuildUserStatusPropsValue];
  change: [value: GuildUserStatusPropsValue];
}>();

function transToPropsValue(value: SelectValue): GuildUserStatusPropsValue {
  const oldValue = props.modelValue;
  if (oldValue === 'all') {
    return value.filter(item => item !== 'all');
  }
  if (value.includes('all')) {
    return 'all';
  }
  return value as TKGuildUserStatus[];
}

const filterText = ref<string>();

function handleFilter(query: string) {
  filterText.value = query;
}

function handleChange(value: SelectValue) {
  emit('change', transToPropsValue(value));
}

const value = computed<SelectValue>({
  get() {
    if (props.modelValue === 'all') {
      return ['all'];
    }
    return props.modelValue as TKGuildUserStatus[];
  },
  set(newValue: SelectValue) {
    emit('update:modelValue', transToPropsValue(newValue));
  },
});

const allOptions = computed<
  {
    label: string;
    value: TKGuildUserStatus | 'all';
    description?: string;
  }[]
>(() => {
  if (props.showAll) {
    return [{ label: '全部', value: 'all' }, ...props.options];
  }
  return props.options;
});

const showOptions = computed(() => {
  const q = filterText.value?.trim();
  if (!q) {
    return allOptions.value;
  }
  return allOptions.value.filter(item => item.label.includes(q));
});

const isWebSize = useIsWebSize(); // 移动端屏蔽搜索，因为会弹出键盘，影响使用
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
    :multiple="true"
    :placeholder="placeholder"
    :filterable="isWebSize"
    :filter-method="handleFilter"
    :reserve-keyword="false"
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
