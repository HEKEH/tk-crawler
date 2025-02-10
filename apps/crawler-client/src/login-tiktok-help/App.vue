<script setup lang="ts">
import { ElButton } from 'element-plus';
import { onBeforeUnmount, ref } from 'vue';
import {
  LOGIN_TIKTOK_HELP_EVENTS,
  LOGIN_TIKTOK_STATUS,
} from '../main/constants';
import 'element-plus/dist/index.css';

const loginStatus = ref(LOGIN_TIKTOK_STATUS.stateless);
async function updateLoginStatus() {
  const status = await window.ipcRenderer.invoke(
    LOGIN_TIKTOK_HELP_EVENTS.GET_LOGIN_TIKTOK_STATUS,
  );
  loginStatus.value = status;
}
updateLoginStatus();
const intervalId = setInterval(updateLoginStatus, 100);
onBeforeUnmount(() => {
  clearInterval(intervalId);
});
function onRetry() {
  window.ipcRenderer.invoke(
    LOGIN_TIKTOK_HELP_EVENTS.RETRY_OPEN_TIKTOK_LOGIN_PAGE,
  );
}
</script>

<template>
  <div
    v-if="loginStatus === LOGIN_TIKTOK_STATUS.loading"
    v-loading="true"
    class="container"
    element-loading-text="加载中..."
  />
  <div
    v-else-if="loginStatus === LOGIN_TIKTOK_STATUS.timeout"
    class="container"
  >
    <div class="tip-text">
      请求超时，请检查是否开启VPN，且VPN是否开启了全局代理
    </div>
    <ElButton type="primary" @click="onRetry">点击重试</ElButton>
  </div>
  <div v-else-if="loginStatus === LOGIN_TIKTOK_STATUS.fail" class="container">
    <div class="tip-text">打开登录页失败，请检查网络</div>
    <ElButton type="primary" @click="onRetry">点击重试</ElButton>
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
  row-gap: 10px;
}
.tip-text {
  color: var(--el-color-primary);
  font-size: 20px;
  font-weight: 500;
}
</style>
