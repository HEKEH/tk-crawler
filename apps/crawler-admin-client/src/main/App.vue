<script setup lang="ts">
import { ElConfigProvider, ElNotification } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { onBeforeUnmount, onErrorCaptured } from 'vue';
import Homepage from './sections/homepage.vue';
import { provideGlobalStore } from './utils';

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
  <ElConfigProvider :locale="zhCn">
    <Homepage />
  </ElConfigProvider>
</template>

<style scoped></style>
