<script setup lang="ts">
import { ArrowLeftBold } from '@element-plus/icons-vue';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS,
} from '@tk-crawler/main-client-shared';
import { ElButton, ElIcon } from 'element-plus';
import { onBeforeUnmount, ref } from 'vue';
import LoggedInView from './logged-in-view.vue';
import NotLoginView from './not-login-view.vue';
import { MessageQueue } from '@tk-crawler/view-shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { IpcRendererEvent } from 'electron';

defineOptions({
  name: 'MainView',
});

const status = ref(GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless);
async function updateStatus() {
  status.value = await window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.GET_RUNNING_STATUS,
  );
}
updateStatus();
const intervalId = setInterval(updateStatus, 100);
onBeforeUnmount(() => {
  clearInterval(intervalId);
});

async function backToMainView() {
  await window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW,
  );
}

const messageQueue = new MessageQueue({
  messageOffset: 200,
});

const electronRenderListeners = ElectronRenderListeners.getInstance();

function handleRequestError(_: IpcRendererEvent, message: string) {
  messageQueue.showMessage({
    message,
    type: 'error',
  });
}

electronRenderListeners.on(
  GUILD_COOKIE_PAGE_HELP_EVENTS.REQUEST_ERROR,
  handleRequestError,
);

onBeforeUnmount(() => {
  electronRenderListeners.off(
    GUILD_COOKIE_PAGE_HELP_EVENTS.REQUEST_ERROR,
    handleRequestError,
  );
});
</script>

<template>
  <div
    v-loading="status === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.stateless"
    class="main-view-container"
  >
    <div class="view-header">
      <ElButton link type="primary" @click="backToMainView">
        <ElIcon><ArrowLeftBold /></ElIcon>返回主页
      </ElButton>
    </div>
    <NotLoginView
      v-if="status === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.not_login"
    />
    <LoggedInView
      v-else-if="status === GUILD_COOKIE_PAGE_HELP_RUNNING_STATUS.logged_in"
    />
  </div>
</template>

<style scoped>
.main-view-container {
  padding: 20px 20px;
  width: 100%;
  height: 100%;
  margin-right: 2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
  border-right: 1px dashed var(--el-color-primary);
  .view-header {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
