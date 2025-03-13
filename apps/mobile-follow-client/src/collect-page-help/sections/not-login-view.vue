<script setup lang="ts">
import { COLLECT_PAGE_HELP_EVENTS } from '@tk-mobile-follow-client/shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'NotLoginView',
});

async function nextStep() {
  await window.ipcRenderer.invoke(
    COLLECT_PAGE_HELP_EVENTS.REFRESH_RUNNING_STATUS,
  );
}
</script>

<template>
  <div class="block">
    <div class="description">
      您似乎尚未登录，请在右侧页面登录后，再点击下方按钮
    </div>
    <ElButton type="primary" @click="nextStep">下一步</ElButton>
  </div>
</template>

<style scoped>
.description {
  font-size: 14px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
</style>
