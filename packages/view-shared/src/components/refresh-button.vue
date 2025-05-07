<script setup lang="ts">
import type { ButtonProps } from 'element-plus';
import { RefreshRight } from '@element-plus/icons-vue';
import { ElButton, ElIcon } from 'element-plus';

const props = withDefaults(defineProps<Partial<ButtonProps>>(), {
  size: 'small',
});
const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <ElButton v-bind="props" @click="emit('click')">
    <ElIcon style="margin-right: 0.25rem">
      <RefreshRight />
    </ElIcon>
    刷新
  </ElButton>
</template>
