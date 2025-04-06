<script setup lang="ts">
import { GUILD_COOKIE_PAGE_HELP_EVENTS } from '@tk-crawler/main-client-shared';
import { ElImage, ElButton } from 'element-plus';

defineOptions({
  name: 'LoggedInView',
});
function finish() {
  window.ipcRenderer.invoke(GUILD_COOKIE_PAGE_HELP_EVENTS.FINISH);
}
</script>

<template>
  <div class="block">
    <div class="tip">正在尝试激活账号...</div>
    <div class="description">
      激活过程中有可能遇到如下验证弹窗，此时需要您在页面手动操作来通过验证。
    </div>
    <ElImage class="image" src="/images/live-admin-verify-popup.png" />
    <div class="description">
      如果您看到如下页面，则表明激活成功。此时请点击按钮
      <ElButton type="primary" size="small" @click="finish"> 完成 </ElButton>
    </div>
    <ElImage class="image" src="/images/account-activate-finish.png" />
  </div>
</template>

<style scoped>
.description {
  width: 100%;
  font-size: 15px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
.tip {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: var(--el-color-primary);
}
.image {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 4px;
}
</style>
