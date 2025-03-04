<script setup lang="ts">
import { TIKTOK_AUTO_FOLLOW_PAGE_EVENTS } from '@tk-ios-follow-client/shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'IsRunning',
});
async function onPause() {
  await window.ipcRenderer.invoke(
    TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.PAUSE_AUTO_FOLLOW,
  );
}
</script>

<template>
  <div class="block">
    <div class="description">
      <div>自动关注任务正在执行中...</div>
      <div>如需暂停任务，请点击下方按钮</div>
    </div>
    <ElButton @click="onPause">暂停任务</ElButton>
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
</style>
