<script setup lang="ts">
import { GUILD_COOKIE_PAGE_HELP_EVENTS } from '@tk-crawler/main-client-shared';
import { ElButton, ElImage } from 'element-plus';

defineOptions({
  name: 'NotLoginView',
});

async function nextStep() {
  window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.CHECK_IF_LOGIN_SUCCESS,
  );
}
</script>

<template>
  <div class="block">
    <div class="tip">系统正在使用您填写的用户密码尝试自动登录...</div>
    <div class="description">
      如果遇到如下验证弹窗，则无法自动登录成功，需要您来手动选择两个相同图形来操作完成。
    </div>
    <ElImage src="images/live-admin-verify-popup.png" />
    <div class="description">
      请在登录成功后，点击按钮
      <ElButton type="primary" size="small" @click="nextStep">
        下一步
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.description {
  font-size: 14px;
}
.tip {
  font-size: 14px;
  font-weight: bold;
  color: var(--el-color-primary);
}
.block {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}
</style>
