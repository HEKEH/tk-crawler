<script setup lang="ts">
import { ArrowLeftBold } from '@element-plus/icons-vue';
import {
  COLLECT_PAGE_HELP_EVENTS,
  COLLECT_PAGE_HELP_RUNNING_STATUS,
} from '@tk-mobile-follow-client/shared';
import { ElButton, ElIcon } from 'element-plus';
import { onBeforeUnmount, ref } from 'vue';
import CollectView from './collect-view.vue';
import NotLoginView from './not-login-view.vue';

defineOptions({
  name: 'MainView',
});

const status = ref(COLLECT_PAGE_HELP_RUNNING_STATUS.stateless);
async function updateStatus() {
  status.value = await window.ipcRenderer.invoke(
    COLLECT_PAGE_HELP_EVENTS.GET_RUNNING_STATUS,
  );
}
updateStatus();
const intervalId = setInterval(updateStatus, 100);
onBeforeUnmount(() => {
  clearInterval(intervalId);
});

async function backToMainView() {
  await window.ipcRenderer.invoke(COLLECT_PAGE_HELP_EVENTS.BACK_TO_MAIN_VIEW);
}
</script>

<template>
  <div
    v-loading="status === COLLECT_PAGE_HELP_RUNNING_STATUS.stateless"
    class="main-view-container"
  >
    <div class="view-header">
      <ElButton link type="primary" @click="backToMainView">
        <ElIcon><ArrowLeftBold /></ElIcon>返回主页
      </ElButton>
    </div>
    <NotLoginView
      v-if="status === COLLECT_PAGE_HELP_RUNNING_STATUS.not_login"
    />
    <CollectView
      v-else-if="status === COLLECT_PAGE_HELP_RUNNING_STATUS.running"
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
