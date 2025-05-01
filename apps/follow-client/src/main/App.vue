<script setup lang="ts">
import type GlobalStore from './domain/global-store';
import { CheckNetworkResultType } from '@tk-follow-client/shared';
import { ElNotification } from 'element-plus';
import { computed, onBeforeUnmount, onErrorCaptured } from 'vue';

import Homepage from './sections/homepage.vue';
import NetworkErrorView from './sections/network-error-view/index.vue';
import { provideGlobalStore } from './utils/vue';
// import { CrawlerViewMessage } from './constants';

const globalStore: GlobalStore = provideGlobalStore();

globalStore.init();
const isLoading = computed(() => {
  return !globalStore.isInitialized;
});

async function retryCheckNetwork() {
  await globalStore.retryCheckNetwork();
}

// const cookieOutdatedSubscription = globalStore.messageCenter.addListener(
//   CrawlerViewMessage.TIKTOK_COOKIE_OUTDATED,
//   () => {
//     ElNotification.error({
//       message: 'Tiktok cookie已过期，请重新登录',
//     });
//   },
// );

onBeforeUnmount(() => {
  // cookieOutdatedSubscription.unsubscribe();
  globalStore.destroy();
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
  <NetworkErrorView
    v-else-if="globalStore.networkStatus === CheckNetworkResultType.ERROR"
    @retry="retryCheckNetwork"
  />
  <Homepage v-else />
</template>

<style scoped></style>
