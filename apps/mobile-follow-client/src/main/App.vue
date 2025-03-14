<script setup lang="ts">
import type GlobalStore from './domain/global-store';
import { CheckNetworkResultType } from '@tk-mobile-follow-client/shared';
import { ElConfigProvider, ElNotification } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import { computed, onBeforeUnmount, onErrorCaptured } from 'vue';
import Homepage from './sections/homepage.vue';
import NetworkErrorView from './sections/network-error-view/index.vue';
import { provideGlobalStore } from './utils/vue';
import 'element-plus/dist/index.css';

const globalStore: GlobalStore = provideGlobalStore();

globalStore.init();
const isLoading = computed(() => {
  return !globalStore.isInitialized;
});

async function retryCheckNetwork() {
  await globalStore.retryCheckNetwork();
}

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
  <ElConfigProvider :locale="zhCn">
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
  </ElConfigProvider>
</template>

<style scoped></style>
