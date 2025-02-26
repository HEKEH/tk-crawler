<script setup lang="ts">
import { ElNotification } from 'element-plus';
import { computed, onBeforeUnmount, onErrorCaptured } from 'vue';
import { CrawlerViewMessage } from './constants';
import Homepage from './sections/homepage.vue';
import { provideGlobalStore } from './utils/vue';
import 'element-plus/dist/index.css';

const globalStore = provideGlobalStore();

globalStore.init();
const isLoading = computed(() => {
  return !globalStore.isInitialized;
});

const cookieOutdatedSubscription = globalStore.messageCenter.addListener(
  CrawlerViewMessage.TIKTOK_COOKIE_OUTDATED,
  () => {
    ElNotification.error({
      message: 'Tiktok cookie已过期，请重新登录',
    });
  },
);

onBeforeUnmount(() => {
  cookieOutdatedSubscription.unsubscribe();
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
