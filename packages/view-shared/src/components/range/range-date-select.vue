<script lang="ts" setup>
import { ElDatePicker, ElDivider } from 'element-plus';
import { ref, watch } from 'vue';

interface Props {
  modelValue?: [Date | undefined, Date | undefined];
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  error?: boolean;
  startLabel?: string;
  endLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  type?: 'date' | 'datetime' | 'week' | 'month' | 'year';
  format?: string;
  valueFormat?: string;
  disabledDate?: (date: Date) => boolean;
  shortcuts?: Array<{
    text: string;
    value: Date | (() => Date);
  }>;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  checkValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [undefined, undefined],
  size: 'default',
  disabled: false,
  error: false,
  startPlaceholder: '请选择',
  endPlaceholder: '请选择',
  type: 'date',
  clearable: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: [Date | undefined, Date | undefined]): void;
  (e: 'change', value: [Date | undefined, Date | undefined]): void;
}>();

const startValue = ref(props.modelValue[0]);
const endValue = ref(props.modelValue[1]);

// 监听内部值变化
watch([startValue, endValue], ([newStart, newEnd]) => {
  const newValue: [Date | undefined, Date | undefined] = [newStart, newEnd];
  emit('update:modelValue', newValue);
  emit('change', newValue);
});

// 监听外部值变化
watch(
  () => props.modelValue,
  ([newStart, newEnd]) => {
    startValue.value = newStart;
    endValue.value = newEnd;
  },
);

// 处理起始值变化
function handleStartBlur() {
  if (
    props.checkValue &&
    startValue.value !== undefined &&
    endValue.value !== undefined &&
    startValue.value > endValue.value
  ) {
    endValue.value = undefined;
  }
}

// 处理结束值变化
function handleEndBlur() {
  if (
    props.checkValue &&
    endValue.value !== undefined &&
    startValue.value !== undefined &&
    endValue.value < startValue.value
  ) {
    startValue.value = undefined;
  }
}

// 禁用日期处理
function disabledStartDate(date: Date) {
  if (props.disabledDate?.(date)) {
    return true;
  }
  if (props.minDate && date < props.minDate) {
    return true;
  }
  if (props.maxDate && date > props.maxDate) {
    return true;
  }
  if (endValue.value) {
    return date > endValue.value;
  }
  return false;
}

function disabledEndDate(date: Date) {
  if (props.disabledDate?.(date)) {
    return true;
  }
  if (props.minDate && date < props.minDate) {
    return true;
  }
  if (props.maxDate && date > props.maxDate) {
    return true;
  }
  if (startValue.value) {
    return date < startValue.value;
  }
  return false;
}
</script>

<template>
  <div
    class="vs-range-date-select"
    :class="[
      `vs-range-date-select--${size}`,
      {
        'is-disabled': disabled,
        'is-error': error,
      },
    ]"
  >
    <span v-if="startLabel" class="vs-range-date-select__label">{{
      startLabel
    }}</span>
    <ElDatePicker
      :model-value="startValue"
      :type="type"
      :size="size"
      :disabled="disabled"
      :placeholder="startPlaceholder"
      :format="format"
      :value-format="valueFormat"
      :shortcuts="shortcuts"
      :disabled-date="disabledStartDate"
      :clearable="clearable"
      @update:model-value="startValue = $event ?? undefined"
      @blur="handleStartBlur"
    />

    <ElDivider direction="horizontal" class="vs-range-date-select__divider" />

    <span v-if="endLabel" class="vs-range-date-select__label">{{
      endLabel
    }}</span>
    <ElDatePicker
      :model-value="endValue"
      :type="type"
      :size="size"
      :disabled="disabled"
      :placeholder="endPlaceholder"
      :format="format"
      :value-format="valueFormat"
      :shortcuts="shortcuts"
      :disabled-date="disabledEndDate"
      :clearable="clearable"
      @update:model-value="endValue = $event ?? undefined"
      @blur="handleEndBlur"
    />
  </div>
</template>

<style lang="scss" scoped>
.vs-range-date-select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow: hidden;

  &__label {
    color: var(--el-text-color-regular);
    font-size: 14px;
  }

  &__divider {
    margin: 0;
    min-width: 10px;
    width: 10px;
    color: var(--el-text-color-secondary);
  }

  :deep(.el-date-editor) {
    flex: 1;
  }

  &--small {
    .vs-range-date-select__label {
      font-size: 12px;
    }
  }

  &--large {
    .vs-range-date-select__label {
      font-size: 16px;
    }
  }

  &.is-disabled {
    .vs-range-date-select__label {
      color: var(--el-text-color-disabled);
    }
  }

  &.is-error {
    :deep(.el-date-editor .el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }
}
</style>
