<script setup lang="ts">
import type { Area, AreaOption } from '@tk-crawler/biz-shared';
import { InfoFilled } from '@element-plus/icons-vue';
import { AREA_OPTIONS } from '@tk-crawler/biz-shared';
import { ElIcon, ElOption, ElSelect, ElTooltip } from 'element-plus';
import { computed, ref } from 'vue';

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
        <ElTooltip
          v-if="option.description"
          popper-style="max-width: 200px;"
          :content="option.description"
          placement="top"
          effect="light"
        >
          <ElIcon class="info-icon"><InfoFilled /></ElIcon>
        </ElTooltip>
      </div>
    </ElOption>
  </ElSelect>
</template>

<style scoped>
.option-with-description {
  display: flex;
  align-items: center;
}

.info-icon {
  margin-left: 5px;
  font-size: 14px;
  color: #909399;
  cursor: help;
}
</style>
