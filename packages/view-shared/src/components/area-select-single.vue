<script setup lang="ts">
import type { Area, AreaOption } from '@tk-crawler/biz-shared';
import { AREA_OPTIONS } from '@tk-crawler/biz-shared';
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref } from 'vue';
import AreaTooltipIcon from './area-tooltip-icon.vue';

defineOptions({
  name: 'AreaSelectSingle',
});

const props = withDefaults(
  defineProps<{
    modelValue?: AreaPropsValue;
    placeholder?: string;
    showAll?: boolean;
    options?: AreaOption[];
  }>(),
  {
    placeholder: '请选择区域',
    showAll: false,
    options: () => AREA_OPTIONS,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: AreaPropsValue | undefined];
  change: [value: AreaPropsValue | undefined];
}>();

type AreaPropsValue = Area | 'all';

const filterText = ref<string>();

function handleFilter(query: string) {
  filterText.value = query;
}

function handleChange(value: Area) {
  emit('change', value);
}

const value = computed<AreaPropsValue | undefined>({
  get() {
    return props.modelValue;
  },
  set(newValue: AreaPropsValue | undefined) {
    emit('update:modelValue', newValue);
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
</script>

<template>
  <ElSelect
    v-bind="$attrs"
    v-model="value"
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
