<script lang="ts" setup>
import { ElDivider, ElInputNumber } from 'element-plus';
import { ref, watch } from 'vue';

interface Props {
  modelValue?: [number | undefined, number | undefined];
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  error?: boolean;
  startLabel?: string;
  endLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  precision?: number;
  controls?: boolean;
  checkValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [undefined, undefined],
  size: 'default',
  disabled: false,
  error: false,
  startPlaceholder: '大于或等于',
  endPlaceholder: '小于或等于',
  step: 1,
  controls: true,
});

const emit = defineEmits<{
  (
    e: 'update:modelValue',
    value: [number | undefined, number | undefined],
  ): void;
  (e: 'change', value: [number | undefined, number | undefined]): void;
}>();

const startValue = ref(props.modelValue[0]);
const endValue = ref(props.modelValue[1]);

// 监听内部值变化
watch([startValue, endValue], ([newStart, newEnd]) => {
  const newValue: [number | undefined, number | undefined] = [newStart, newEnd];
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
</script>

<template>
  <div
    class="vs-range-number-input"
    :class="[
      `vs-range-number-input--${size}`,
      {
        'is-disabled': disabled,
        'is-error': error,
      },
    ]"
  >
    <span v-if="startLabel" class="vs-range-number-input__label">{{
      startLabel
    }}</span>
    <ElInputNumber
      :model-value="startValue"
      :size="size"
      :disabled="disabled"
      :placeholder="startPlaceholder"
      :min="min"
      :max="max"
      :step="step"
      :precision="precision"
      :controls="controls"
      @update:model-value="startValue = $event ?? undefined"
      @blur="handleStartBlur"
    />

    <ElDivider direction="horizontal" class="vs-range-number-input__divider" />

    <span v-if="endLabel" class="vs-range-number-input__label">{{
      endLabel
    }}</span>
    <ElInputNumber
      :model-value="endValue"
      :size="size"
      :disabled="disabled"
      :placeholder="endPlaceholder"
      :min="min"
      :max="max"
      :step="step"
      :precision="precision"
      :controls="controls"
      @update:model-value="endValue = $event ?? undefined"
      @blur="handleEndBlur"
    />
  </div>
</template>

<style lang="scss" scoped>
.vs-range-number-input {
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

  :deep(.el-input-number) {
    flex: 1;
  }

  &--small {
    .vs-range-number-input__label {
      font-size: 12px;
    }
  }

  &--large {
    .vs-range-number-input__label {
      font-size: 16px;
    }
  }

  &.is-disabled {
    .vs-range-number-input__label {
      color: var(--el-text-color-disabled);
    }
  }

  &.is-error {
    :deep(.el-input-number .el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }
}
</style>
