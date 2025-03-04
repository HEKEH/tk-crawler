<script setup lang="ts">
import { TIKTOK_AUTO_FOLLOW_PAGE_EVENTS } from '@tk-mobile-follow-client/shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'NotStarted',
});
async function onStart() {
  await window.ipcRenderer.invoke(
    TIKTOK_AUTO_FOLLOW_PAGE_EVENTS.START_AUTO_FOLLOW,
  );
}
</script>

<template>
  <div class="block">
    <div class="description">点击下面按钮开始执行自动关注任务</div>
    <ElButton type="primary" @click="onStart">开始执行</ElButton>
  </div>
</template>

<style scoped>
.description {
  font-size: 14px;
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
