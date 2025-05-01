<script setup lang="ts">
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  GUILD_COOKIE_PAGE_HELP_STATUS,
} from '@tk-crawler/main-client-shared';
import { ElButton } from 'element-plus';
import { onBeforeUnmount, ref } from 'vue';
import MainView from './sections/main-view.vue';

const status = ref(GUILD_COOKIE_PAGE_HELP_STATUS.stateless);
async function updateStatus() {
  status.value = await window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.GET_STATUS,
  );
}
updateStatus();
const intervalId = setInterval(updateStatus, 100);
onBeforeUnmount(() => {
  clearInterval(intervalId);
});
function onRetry() {
  window.ipcRenderer.invoke(GUILD_COOKIE_PAGE_HELP_EVENTS.RETRY_OPEN_PAGE);
}
function onBackToMainView() {
  window.ipcRenderer.invoke(GUILD_COOKIE_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW);
}
</script>

<template>
  <div
    v-loading="status === GUILD_COOKIE_PAGE_HELP_STATUS.loading"
    class="app-container"
    element-loading-text="加载中..."
  >
    <template v-if="status === GUILD_COOKIE_PAGE_HELP_STATUS.timeout">
      <div class="tip-text">
        请求超时，请检查是否开启VPN，且VPN是否开启了全局代理
      </div>
      <div class="button-app-container">
        <ElButton type="primary" @click="onRetry">点击重试</ElButton>
        <ElButton @click="onBackToMainView">回到主页</ElButton>
      </div>
    </template>
    <template v-else-if="status === GUILD_COOKIE_PAGE_HELP_STATUS.fail">
      <div class="tip-text">打开TK直播公会后台页失败，请检查网络</div>
      <div class="button-app-container">
        <ElButton type="primary" @click="onRetry">点击重试</ElButton>
        <ElButton @click="onBackToMainView">回到主页</ElButton>
      </div>
    </template>
    <MainView v-else-if="status === GUILD_COOKIE_PAGE_HELP_STATUS.opened" />
  </div>
</template>

<style scoped>
.app-container {
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
.button-app-container {
  display: flex;
}
</style>
