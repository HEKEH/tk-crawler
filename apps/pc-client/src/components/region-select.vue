<script setup lang="ts">
import type { Region } from '@tk-crawler/shared';
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref } from 'vue';
import { REGION_OPTIONS } from '../constants';

type RegionPropsValue = Region[] | 'all';
type SelectValue = (Region | 'all')[];

defineOptions({
  name: 'RegionSelect',
});

const props = withDefaults(
  defineProps<{
    modelValue?: RegionPropsValue;
    placeholder?: string;
  }>(),
  {
    placeholder: '请选择国家/地区',
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

const filterText = ref<string>();

function handleFilter(query: string) {
  filterText.value = query;
}

const options = computed(() => {
  const q = filterText.value?.trim();
  if (!q) {
    return REGION_OPTIONS;
  }
  return REGION_OPTIONS.filter(item => item.label.includes(q));
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
    @change="handleChange"
  >
    <ElOption
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </ElSelect>
</template>
