<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import LoginForm from './login-form.vue';

const route = useRoute();
const dialogVisible = ref(false);

// Use computed to reactively access query parameters
const shouldShowLogin = computed(() => route.query.login === 'true');

// Watch for changes in the query parameter
watch(
  shouldShowLogin,
  newValue => {
    dialogVisible.value = newValue;
  },
  { immediate: true },
);

function handleClick() {
  dialogVisible.value = true;
}

function handleClose() {
  dialogVisible.value = false;
}

// 处理登录成功
function handleLoginSuccess() {
  dialogVisible.value = false;
}

// 处理登录失败
function handleLoginError() {
  // 登录失败时保持弹窗打开
}
</script>

<template>
  <ElButton type="text" @click="handleClick"> 登录 </ElButton>

  <ElDialog
    v-model="dialogVisible"
    title="系统登录"
    width="400px"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="true"
    @close="handleClose"
  >
    <LoginForm @success="handleLoginSuccess" @error="handleLoginError" />
  </ElDialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 500;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
}
</style>
