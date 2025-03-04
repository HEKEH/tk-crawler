<script setup lang="ts">
import { LOGIN_TIKTOK_HELP_EVENTS } from '@tk-mobile-follow-client/shared';
import { ElButton } from 'element-plus';

defineOptions({
  name: 'MainView',
});

async function nextStep() {
  await window.ipcRenderer.invoke(LOGIN_TIKTOK_HELP_EVENTS.LOGIN_CONFIRMED);
}
</script>

<template>
  <div class="main-view-container">
    <div class="block">
      <div class="description">
        <div>请查看右侧页面是否已登录您的TikTok账号:</div>
        <div>• 如果已登录且账号信息正确，请直接点击下方按钮</div>
        <div>• 如果尚未登录，请在登录成功后再点击下方按钮</div>
        <div>• 如需切换账户，请在右侧注销后重新登录</div>
      </div>
      <ElButton type="primary" @click="nextStep">进入主页</ElButton>
    </div>
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
  font-size: 14px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
</style>
