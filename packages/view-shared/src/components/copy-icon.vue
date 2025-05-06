<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue';
import { ElIcon, ElTooltip } from 'element-plus';
import { copyToClipboard } from '../utils/copy';
import { useIsWebSize } from '../hooks';

defineOptions({
  name: 'CopyIcon',
  inheritAttrs: true,
});

defineProps<{
  tooltip: string;
  copyContent: string;
}>();
const isWebSize = useIsWebSize();
</script>

<template>
  <ElTooltip v-if="isWebSize" :content="tooltip" placement="top">
    <ElIcon
      v-bind="$attrs"
      class="copy-icon"
      @click="copyToClipboard(copyContent)"
    >
      <CopyDocument />
    </ElIcon>
  </ElTooltip>
  <ElIcon
    v-else
    v-bind="$attrs"
    class="copy-icon"
    @click="copyToClipboard(copyContent)"
  >
    <CopyDocument />
  </ElIcon>
</template>

<style scoped>
.copy-icon {
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
