<script setup lang="ts">
import { ElButton } from 'element-plus';

defineOptions({
  name: 'CookieNotValidView',
});

const emit = defineEmits<{
  (e: 'loginTiktok'): void;
}>();

async function loginTiktok() {
  emit('loginTiktok');
}
</script>

<template>
  <div class="cookie-not-valid-view">
    <div>无法获取Tiktok Cookie，或者 Cookie 已失效，请重新登录 Tiktok 账号</div>
    <ElButton
      type="primary"
      style="margin-top: 1rem"
      @click.prevent="loginTiktok"
    >
      打开Tiktok登录页
    </ElButton>
  </div>
</template>

<style scoped>
.cookie-not-valid-view {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  row-gap: 20px;
}
</style>
