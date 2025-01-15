<script setup lang="ts">
import type { Region } from '@tk-crawler/shared';
import type { RegionPropsValue } from './region-select';
import { ElOption, ElSelect } from 'element-plus';
import { computed } from 'vue';
import { REGION_OPTIONS } from '../constants';

export type SelectValue = (Region | 'all')[];

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

function handleChange(value: SelectValue) {
  let v: RegionPropsValue;
  const oldValue = props.modelValue;
  if (oldValue === 'all') {
    v = value.filter(item => item !== 'all');
  } else {
    if (value.includes('all')) {
      v = 'all';
    } else {
      v = value as Region[];
    }
  }
  emit('update:modelValue', v);
  emit('change', v);
}

const value = computed<SelectValue>({
  get() {
    if (props.modelValue === 'all') {
      return ['all'];
    }
    return props.modelValue as Region[];
  },
  set(newValue: SelectValue) {
    handleChange(newValue);
  },
});
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
    :multiple="true"
    :placeholder="placeholder"
    @change="handleChange"
  >
    <ElOption
      v-for="option in REGION_OPTIONS"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </ElSelect>
</template>
