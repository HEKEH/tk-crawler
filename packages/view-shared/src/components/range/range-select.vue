<script lang="ts" setup>
import { ElDivider, ElOption, ElSelect } from 'element-plus';
import { ref, watch } from 'vue';

interface RangeOption {
  label: string;
  value: any;
  disabled?: boolean;
}

interface Props {
  modelValue?: [any, any];
  options: RangeOption[];
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  clearable?: boolean;
  error?: boolean;
  startLabel?: string;
  endLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  separator?: string;
  validateRange?: (start: any, end: any) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [null, null],
  size: 'default',
  disabled: false,
  clearable: true,
  error: false,
  startPlaceholder: '请选择',
  endPlaceholder: '请选择',
  validateRange: (start, end) => {
    if (start == null || end == null) {
      return true;
    }
    return start <= end;
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: [any, any]): void;
  (e: 'change', value: [any, any]): void;
}>();

const startValue = ref(props.modelValue[0]);
const endValue = ref(props.modelValue[1]);

// 监听内部值变化
watch([startValue, endValue], ([newStart, newEnd]) => {
  const newValue: [any, any] = [newStart, newEnd];
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
function handleStartChange(value: any) {
  if (!props.validateRange(value, endValue.value)) {
    endValue.value = null;
  }
}

// 处理结束值变化
function handleEndChange(value: any) {
  if (!props.validateRange(startValue.value, value)) {
    startValue.value = null;
  }
}

// 判断起始选项是否禁用
function isStartOptionDisabled(option: RangeOption) {
  if (option.disabled) {
    return true;
  }
  if (endValue.value == null) {
    return false;
  }
  return !props.validateRange(option.value, endValue.value);
}

// 判断结束选项是否禁用
function isEndOptionDisabled(option: RangeOption) {
  if (option.disabled) {
    return true;
  }
  if (startValue.value == null) {
    return false;
  }
  return !props.validateRange(startValue.value, option.value);
}
</script>

<template>
  <div
    class="vs-range-select"
    :class="[
      `vs-range-select--${size}`,
      {
        'is-disabled': disabled,
        'is-error': error,
      },
    ]"
  >
    <span v-if="startLabel" class="vs-range-select__label">{{
      startLabel
    }}</span>
    <ElSelect
      v-model="startValue"
      :size="size"
      :disabled="disabled"
      :placeholder="startPlaceholder"
      :clearable="clearable"
      @change="handleStartChange"
    >
      <ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="isStartOptionDisabled(option)"
      />
    </ElSelect>

    <ElDivider direction="horizontal" class="vs-range-select__divider" />

    <span v-if="endLabel" class="vs-range-select__label">{{ endLabel }}</span>
    <ElSelect
      v-model="endValue"
      :size="size"
      :disabled="disabled"
      :placeholder="endPlaceholder"
      :clearable="clearable"
      @change="handleEndChange"
    >
      <ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="isEndOptionDisabled(option)"
      />
    </ElSelect>
  </div>
</template>

<style lang="scss" scoped>
.vs-range-select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;

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

  :deep(.el-select) {
    flex: 1;
  }

  &--small {
    .vs-range-select__label {
      font-size: 12px;
    }
  }

  &--large {
    .vs-range-select__label {
      font-size: 16px;
    }
  }

  &.is-disabled {
    .vs-range-select__label {
      color: var(--el-text-color-disabled);
    }
  }

  &.is-error {
    :deep(.el-select .el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }
}
</style>
