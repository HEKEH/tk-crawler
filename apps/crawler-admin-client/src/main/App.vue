<script setup lang="ts">
import { ElNotification } from 'element-plus';
import { onBeforeUnmount, onErrorCaptured } from 'vue';
import Homepage from './sections/homepage.vue';
import { provideGlobalStore } from './utils/vue';
import 'element-plus/dist/index.css';

const globalStore = provideGlobalStore();

globalStore.init();

onBeforeUnmount(async () => {
  await globalStore.destroy();
});
onErrorCaptured(e => {
  ElNotification.error({
    message: typeof e === 'string' ? e : (e as Error).message,
  });
  console.error(e);
  return false;
});
</script>

<template>
  <Homepage />
</template>

<style scoped></style>
