<script setup lang="ts">
import { MessageQueue } from '@tk-crawler/view-shared';
import {
  AUTO_FOLLOWED_RESULT_TYPE,
  TIKTOK_AUTO_FOLLOW_PAGE_EVENTS,
  TIKTOK_AUTO_FOLLOW_RUNNING_STATUS,
} from '@tk-follow-client/shared';
import { markRaw, onBeforeUnmount, ref } from 'vue';
import IsCompleted from './is-completed.vue';
import IsPaused from './is-paused.vue';
import IsRunning from './is-running.vue';
import NotStarted from './not-started.vue';

defineOptions({
  name: 'MainView',
});

const runningStatus = ref(TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.not_started);
async function updateRunningStatus() {
  const status: TIKTOK_AUTO_FOLLOW_RUNNING_STATUS =
    await window.ipcRenderer.invoke(
      TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.GET_RUNNING_STATUS,
    );
  runningStatus.value = status;
}
updateRunningStatus();
const intervalId = setInterval(updateRunningStatus, 100);
onBeforeUnmount(() => {
  clearInterval(intervalId);
});

const messageQueue = markRaw(
  new MessageQueue({
    messageOffset: 200,
  }),
);

function onUserFollowResultMessage(
  _: Electron.IpcRendererEvent,
  data: { user_id: string; type: AUTO_FOLLOWED_RESULT_TYPE },
) {
  switch (data.type) {
    case AUTO_FOLLOWED_RESULT_TYPE.SUCCESS:
      messageQueue.showMessage({
        message: `关注用户成功:\n${data.user_id}`,
        type: 'success',
      });
      break;
    case AUTO_FOLLOWED_RESULT_TYPE.FAIL:
      messageQueue.showMessage({
        message: `关注用户失败:\n${data.user_id}`,
        type: 'error',
      });
      break;
    case AUTO_FOLLOWED_RESULT_TYPE.NOT_FOUND:
      messageQueue.showMessage({
        message: `用户不存在:\n${data.user_id}`,
        type: 'warning',
      });
      break;
    case AUTO_FOLLOWED_RESULT_TYPE.ALREADY_FOLLOWED:
      messageQueue.showMessage({
        message: `用户无需重复关注:\n${data.user_id}`,
        type: 'info',
      });
      break;
  }
}

window.ipcRenderer.on(
  TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.AUTO_FOLLOWED_RESULT,
  onUserFollowResultMessage,
);

onBeforeUnmount(() => {
  window.ipcRenderer.off(
    TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.AUTO_FOLLOWED_RESULT,
    onUserFollowResultMessage,
  );
});
</script>

<template>
  <div class="main-view-container">
    <NotStarted
      v-if="runningStatus === TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.not_started"
    />
    <IsRunning
      v-else-if="runningStatus === TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.running"
    />
    <IsPaused
      v-else-if="runningStatus === TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.paused"
    />
    <IsCompleted
      v-else-if="runningStatus === TIKTOK_AUTO_FOLLOW_RUNNING_STATUS.completed"
    />
  </div>
</template>

<style scoped>
.main-view-container {
  padding: 20px 10px;
  width: 100%;
  height: 100%;
  margin-right: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 30px;
  border-right: 1px dashed var(--el-color-primary);
}
.description {
  font-size: 16px;
}
</style>
