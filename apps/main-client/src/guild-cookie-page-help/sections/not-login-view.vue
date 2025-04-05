<script setup lang="ts">
import { GUILD_COOKIE_PAGE_HELP_EVENTS } from '@tk-crawler/main-client-shared';
import { ElLink } from 'element-plus';

defineOptions({
  name: 'NotLoginView',
});

async function nextStep() {
  await window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.REFRESH_RUNNING_STATUS,
  );
}
</script>

<template>
  <div class="block">
    <div class="description">
      目前正在使用您填写的用户密码尝试登录，如果登录成功，请点击
      <ElLink
        type="primary"
        :underline="false"
        style="vertical-align: baseline"
        @click="nextStep"
      >
        下一步
      </ElLink>
    </div>
    <div class="description">
      如果无法自动登录成功，请手动登录后，再点击
      <ElLink
        type="primary"
        :underline="false"
        style="vertical-align: baseline"
        @click="nextStep"
      >
        下一步
      </ElLink>
    </div>
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
