<script setup lang="ts">
import { ElButton } from 'element-plus';

defineOptions({
  name: 'ControlButtons',
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
</script>

<template>
  <div class="controller-button-container">
    <ElButton style="margin-top: 1rem" type="primary" @click.prevent="start">
      开始爬取数据
    </ElButton>
    <ElButton style="margin-top: 1rem" @click.prevent="stop">
      停止爬取数据
    </ElButton>
  </div>
</template>

<style scoped>
.controller-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* max-width: 600px; */
  column-gap: 20px;
}
</style>
