<script setup lang="ts">
import { TIKTOK_AUTO_FOLLOW_PAGE_EVENTS } from '@tk-follow-client/shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'IsCompleted',
});

async function onStop() {
  await window.ipcRenderer.invoke(
    TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.CLOSE_AND_BACK,
  );
}
</script>

<template>
  <div class="block">
    <div class="description">自动关注任务已全部完成</div>
    <ElButton @click="onStop">回到主页</ElButton>
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
