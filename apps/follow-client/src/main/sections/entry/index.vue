<script setup lang="ts">
import { useGlobalStore } from '../../utils/vue';
import ControlButtons from './control-buttons.vue';

defineOptions({
  name: 'ScrawlerManage',
});

const globalStore = useGlobalStore();

async function start() {
  await globalStore.start();
}
async function stop() {
  await globalStore.stop();
}
</script>

<template>
  <div class="entry">
    <ControlButtons @start="start" @stop="stop" />
  </div>
</template>

<style scoped>
.entry {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
