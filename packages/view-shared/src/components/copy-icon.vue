<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue';
import { ElIcon, ElTooltip } from 'element-plus';
import { copyToClipboard } from '../utils/copy';

defineOptions({
  name: 'CopyIcon',
  inheritAttrs: true,
});

defineProps<{
  tooltip: string;
  copyContent: string;
}>();
</script>

<template>
  <ElTooltip :content="tooltip" placement="top">
    <ElIcon
      v-bind="$attrs"
      class="copy-icon"
      @click="copyToClipboard(copyContent)"
    >
      <CopyDocument />
    </ElIcon>
  </ElTooltip>
</template>

<style scoped>
.copy-icon {
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
