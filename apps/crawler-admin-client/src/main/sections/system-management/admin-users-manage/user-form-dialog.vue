<script setup lang="ts">
import type { SystemAdminUserInfo } from '@tk-crawler/biz-shared';
import { ElDialog, ElScrollbar } from 'element-plus';
import UserForm from './user-form.vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  visible: boolean;
  submit: (data: Partial<SystemAdminUserInfo>) => Promise<void>;
  initialData?: Partial<SystemAdminUserInfo>;
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
    :title="mode === 'create' ? '新增用户' : '编辑用户信息'"
    width="650px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <UserForm
        :mode="mode"
        :initial-data="initialData"
        :submit="props.submit"
        @cancel="handleClose"
      />
    </ElScrollbar>
  </ElDialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
