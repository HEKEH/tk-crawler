<script setup lang="ts">
import type { Region, RegionOption } from '@tk-crawler/biz-shared';
import { REGION_OPTIONS } from '@tk-crawler/biz-shared';
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref } from 'vue';

type RegionPropsValue = Region[] | 'all';
type SelectValue = (Region | 'all')[];

defineOptions({
  name: 'RegionSelect',
});

const props = withDefaults(
  defineProps<{
    modelValue?: RegionPropsValue;
    placeholder?: string;
    showAll?: boolean;
    options?: RegionOption[];
  }>(),
  {
    placeholder: '请选择国家/地区，支持搜索',
    showAll: true,
    options: () => REGION_OPTIONS,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: RegionPropsValue];
  change: [value: RegionPropsValue];
}>();

function transToPropsValue(value: SelectValue): RegionPropsValue {
  const oldValue = props.modelValue;
  if (oldValue === 'all') {
    return value.filter(item => item !== 'all');
  }
  if (value.includes('all')) {
    return 'all';
  }
  return value as Region[];
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
    return props.modelValue as Region[];
  },
  set(newValue: SelectValue) {
    emit('update:modelValue', transToPropsValue(newValue));
  },
});

const allOptions = computed(() => {
  if (props.showAll) {
    return props.options;
  }
  return props.options.filter(item => item.value !== 'all');
});

const showOptions = computed(() => {
  const q = filterText.value?.trim();
  if (!q) {
    return allOptions.value;
  }
  return allOptions.value.filter(item => item.label.includes(q));
});
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
    :multiple="true"
    :placeholder="placeholder"
    filterable
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
