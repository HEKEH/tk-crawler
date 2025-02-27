<script setup lang="ts">
import { TIKTOK_AUTO_FOLLOW_PAGE_EVENTS } from '@tk-follow-client/shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'IsPaused',
});
async function onContinue() {
  await window.ipcRenderer.invoke(
    TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.CONTINUE_AUTO_FOLLOW,
  );
}

async function onCloseAndBack() {
  await window.ipcRenderer.invoke(
    TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.CLOSE_AND_BACK,
  );
}
</script>

<template>
  <div class="block">
    <div class="description">自动关注任务已暂停</div>
    <div class="button-group">
      <ElButton type="primary" @click="onContinue">继续任务</ElButton>
      <ElButton @click="onCloseAndBack">回到主页</ElButton>
    </div>
  </div>
</template>

<style scoped>
.description {
  font-size: 16px;
}
.block {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
.button-group {
  display: flex;
  gap: 12px;
}
</style>
