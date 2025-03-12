<script setup lang="ts">
import type GlobalStore from './domain/global-store';
import { ElNotification } from 'element-plus';
import { computed, onBeforeUnmount, onErrorCaptured } from 'vue';

import Homepage from './sections/homepage.vue';
import { provideGlobalStore } from './utils';
// import { CrawlerViewMessage } from './constants';
import 'element-plus/dist/index.css';

const globalStore: GlobalStore = provideGlobalStore();

globalStore.init();
const isLoading = computed(() => {
  return !globalStore.isInitialized;
});

onBeforeUnmount(() => {
  globalStore.clear();
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
  <div
    v-if="isLoading"
    v-loading="isLoading"
    :style="{ width: '100%', height: '100%', overflow: 'hidden' }"
    element-loading-text="加载中..."
  />
  <Homepage v-else />
</template>

<style scoped></style>
