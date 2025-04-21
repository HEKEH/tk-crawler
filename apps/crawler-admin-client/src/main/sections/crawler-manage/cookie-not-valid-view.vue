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
    <div>TK未登录或登录状态已失效，请重新登录TK账号以继续使用</div>
    <ElButton type="primary" @click.prevent="loginTiktok">
      打开TK登录页
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
