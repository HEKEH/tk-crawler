<script setup lang="ts">
import type { Area, AreaOption } from '@tk-crawler/biz-shared';
import { AREA_OPTIONS } from '@tk-crawler/biz-shared';
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref } from 'vue';
import AreaTooltipIcon from './area-tooltip-icon.vue';

type AreaPropsValue = Area[] | 'all';
type SelectValue = (Area | 'all')[];

defineOptions({
  name: 'AreaSelect',
});

const props = withDefaults(
  defineProps<{
    modelValue?: AreaPropsValue;
    placeholder?: string;
    showAll?: boolean;
    options?: AreaOption[];
  }>(),
  {
    placeholder: '请选择区域，可多选',
    showAll: false,
    options: () => AREA_OPTIONS,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: AreaPropsValue];
  change: [value: AreaPropsValue];
}>();

function transToPropsValue(value: SelectValue): AreaPropsValue {
  const oldValue = props.modelValue;
  if (oldValue === 'all') {
    return value.filter(item => item !== 'all');
  }
  if (value.includes('all')) {
    return 'all';
  }
  return value as Area[];
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
    return props.modelValue as Area[];
  },
  set(newValue: SelectValue) {
    emit('update:modelValue', transToPropsValue(newValue));
  },
});

const allOptions = computed<
  {
    label: string;
    value: Area | 'all';
    description?: string;
  }[]
>(() => {
  if (props.showAll) {
    return [...props.options, { label: '全部', value: 'all' }];
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
    >
      <div class="option-with-description">
        <span>{{ option.label }}</span>
        <AreaTooltipIcon :area="option.value as Area" />
      </div>
    </ElOption>
  </ElSelect>
</template>

<style scoped>
.option-with-description {
  display: flex;
  align-items: center;
  column-gap: 6px;
}
</style>
