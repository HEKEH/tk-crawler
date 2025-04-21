<script setup lang="ts">
import type { OrgMemberChangePasswordRequest } from '@tk-crawler/biz-shared';
import { ElDialog, ElScrollbar } from 'element-plus';
import PasswordModifyForm from './password-change-form.vue';

const props = defineProps<{
  visible: boolean;
  submit: (data: OrgMemberChangePasswordRequest) => Promise<void>;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  emit('close');
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="修改密码"
    width="500px"
    destroy-on-close
    append-to-body
    @close="handleClose"
  >
    <ElScrollbar>
      <PasswordModifyForm :submit="props.submit" @cancel="handleClose" />
    </ElScrollbar>
  </ElDialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
