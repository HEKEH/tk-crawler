<script setup lang="ts">
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'ControlButtons',
});

const props = defineProps({
  isCrawling: Boolean,
});

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'stop'): void;
}>();

async function start() {
  emit('start');
}

async function stop() {
  emit('stop');
}
const isWebSize = useIsWebSize();
</script>

<template>
  <div class="controller-button-container">
    <ElButton
      :disabled="props.isCrawling"
      :size="isWebSize ? 'default' : 'small'"
      type="primary"
      :loading="props.isCrawling"
      @click.prevent="start"
    >
      {{ props.isCrawling ? '正在采集主播' : '开始采集主播' }}
    </ElButton>
    <ElButton
      :disabled="!props.isCrawling"
      :size="isWebSize ? 'default' : 'small'"
      @click.prevent="stop"
    >
      停止采集主播
    </ElButton>
  </div>
</template>

<style lang="scss" scoped>
.controller-button-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
