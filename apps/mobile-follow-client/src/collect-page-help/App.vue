<script setup lang="ts">
import { ElButton } from 'element-plus';
import { onBeforeUnmount, ref } from 'vue';
import {
  COLLECT_PAGE_HELP_EVENTS,
  COLLECT_PAGE_HELP_STATUS,
} from '../main/constants';
import MainView from './sections/main-view.vue';
import 'element-plus/dist/index.css';
import { setIntervalImmediate } from '@tk-crawler/shared';

const status = ref(COLLECT_PAGE_HELP_STATUS.stateless);
async function updateStatus() {
  status.value = await window.ipcRenderer.invoke(
    COLLECT_PAGE_HELP_EVENTS.GET_STATUS,
  );
}
const intervalId = setIntervalImmediate(updateStatus, 100);
onBeforeUnmount(() => {
  clearInterval(intervalId);
});
function onRetry() {
  window.ipcRenderer.invoke(COLLECT_PAGE_HELP_EVENTS.RETRY_OPEN_PAGE);
}
</script>

<template>
  <div
    v-loading="status === COLLECT_PAGE_HELP_STATUS.loading"
    class="container"
    element-loading-text="加载中..."
  >
    <template v-if="status === COLLECT_PAGE_HELP_STATUS.timeout">
      <div class="tip-text">
        请求超时，请检查是否开启VPN，且VPN是否开启了全局代理
      </div>
      <ElButton type="primary" @click="onRetry">点击重试</ElButton>
    </template>
    <template v-else-if="status === COLLECT_PAGE_HELP_STATUS.fail">
      <div class="tip-text">打开登录页失败，请检查网络</div>
      <ElButton type="primary" @click="onRetry">点击重试</ElButton>
    </template>
    <MainView v-else-if="status === COLLECT_PAGE_HELP_STATUS.opened" />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 20px;
}
.tip-text {
  color: var(--el-color-primary);
  font-size: 20px;
  font-weight: 500;
}
</style>
