<script setup lang="ts">
import { ElDialog } from 'element-plus';
import LoginForm from './login-form.vue';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
  (e: 'error'): void;
}>();

function handleLoginSuccess() {
  emit('success');
}

function handleLoginError() {
  emit('error');
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="系统登录"
    width="400px"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="true"
    @close="emit('close')"
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
