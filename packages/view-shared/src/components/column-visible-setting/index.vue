<script setup lang="ts">
import type {
  ColumnVisibleSettingProps,
  VisibleSettingColumnMap,
} from './types';
import { MoreFilled } from '@element-plus/icons-vue';
import { ElIcon, ElPopover } from 'element-plus';
import ColumnVisibleList from './column-visible-list.vue';

defineProps<ColumnVisibleSettingProps>();
const emit = defineEmits<{
  (e: 'update:columnsVisibleMap', value: VisibleSettingColumnMap): void;
}>();

function handleColumnsVisibleMapUpdate(value: VisibleSettingColumnMap) {
  emit('update:columnsVisibleMap', value);
}
</script>

<template>
  <ElPopover
    placement="bottom-end"
    popper-class="p-0 [&_.el-popper\_\_arrow]:hidden"
    :offset="5"
    trigger="click"
  >
    <template #reference>
      <ElIcon v-bind="$attrs" class="cursor-pointer">
        <MoreFilled />
      </ElIcon>
    </template>
    <template #default>
      <div class="pl-2 pr-2 pt-1.5 pb-1.5 font-semibold text-sm md:text-base">
        表格列设置
      </div>
      <ColumnVisibleList
        :columns="columns"
        :columns-visible-map="columnsVisibleMap"
        @update:columns-visible-map="handleColumnsVisibleMapUpdate"
      />
    </template>
  </ElPopover>
</template>
