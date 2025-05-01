<script setup lang="ts">
import type GlobalStore from './domain/global-store';
import { Refresh, Warning } from '@element-plus/icons-vue';
import {
  ElButton,
  ElConfigProvider,
  ElIcon,
  ElNotification,
  ElResult,
} from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { computed, onBeforeUnmount, onErrorCaptured } from 'vue';

import Homepage from './sections/homepage.vue';
import { provideGlobalStore } from './utils';
// import { CrawlerViewMessage } from './constants';
import 'element-plus/dist/index.css';

const globalStore: GlobalStore = provideGlobalStore();

async function initialize() {
  await globalStore.init().catch(_ => {
    // 不用处理
  });
}
initialize();
const isLoading = computed(() => {
  return globalStore.isInitializing;
});

const hasInitializeError = computed(() => {
  return globalStore.hasInitializeError;
});

onBeforeUnmount(() => {
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
  <ElConfigProvider :locale="zhCn">
    <div
      v-if="isLoading"
      v-loading="true"
      :style="{ width: '100%', height: '100%', overflow: 'hidden' }"
      element-loading-text="加载中..."
    />
    <ElResult
      v-else-if="hasInitializeError"
      status="error"
      title="系统初始化失败"
      sub-title="请检查网络连接是否正常，或稍后重试"
    >
      <template #extra>
        <ElButton type="primary" @click="initialize">
          <ElIcon class="mr-1"><Refresh /></ElIcon>
          重新加载
        </ElButton>
      </template>
      <template #icon>
        <ElIcon class="text-6xl text-red-500 mb-4"><Warning /></ElIcon>
      </template>
    </ElResult>
    <Homepage v-else />
  </ElConfigProvider>
</template>

<style scoped></style>
