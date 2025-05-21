<script setup lang="ts">
import type {
  ColumnVisibleSettingProps,
  VisibleSettingColumnMap,
} from './types';
import { ElCheckbox } from 'element-plus';
import { computed } from 'vue';

const props = defineProps<ColumnVisibleSettingProps>();

const emit = defineEmits<{
  (e: 'update:columnsVisibleMap', value: VisibleSettingColumnMap): void;
}>();

const completeColumnVisibleMap = computed(() => {
  return props.columns.reduce(
    (acc, column) => {
      if (props.columnsVisibleMap[column.key] !== undefined) {
        acc[column.key] = props.columnsVisibleMap[column.key];
      } else {
        acc[column.key] = !column.defaultHidden;
      }
      return acc;
    },
    {} as Record<string, boolean>,
  );
});

function handleColumnVisibleChange(key: string, value: boolean) {
  const defaultHidden = props.columns.find(
    column => column.key === key,
  )?.defaultHidden;
  let newMap: VisibleSettingColumnMap;
  if (value === !defaultHidden) {
    // 还原即可
    newMap = { ...props.columnsVisibleMap };
    delete newMap[key];
  } else {
    newMap = { ...props.columnsVisibleMap, [key]: value };
  }
  emit('update:columnsVisibleMap', newMap);
}
</script>

<template>
  <div class="max-h-[240px] overflow-y-auto md:max-h-[300px]">
    <div
      v-for="column in columns"
      :key="column.key"
      class="pl-2 pr-2 cursor-pointer transition-colors hover:bg-gray-100 md:pt-1 md:pb-1"
    >
      <ElCheckbox
        class="text-xs md:text-sm w-full"
        :model-value="completeColumnVisibleMap[column.key]"
        @change="val => handleColumnVisibleChange(column.key, val as boolean)"
      >
        {{ column.label }}
      </ElCheckbox>
    </div>
  </div>
</template>
