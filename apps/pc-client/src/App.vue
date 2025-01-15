<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import Homepage from './sections/homepage.vue';
import { provideGlobalStore } from './utils/vue';
import 'element-plus/dist/index.css';

const globalStore = provideGlobalStore();

globalStore.init();
const isLoading = computed(() => {
  return !globalStore.liveAnchorCrawlerSettings;
});

onBeforeUnmount(() => {
  globalStore.clear();
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
