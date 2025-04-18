<script setup lang="ts">
import type { GuildUserFormValues } from './guild-user-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import GuildUserForm from './guild-user-form.vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  visible: boolean;
  submit: (data: GuildUserFormValues) => Promise<void>;
  initialData?: Partial<GuildUserFormValues>;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  emit('close');
}

function handleSubmit(data: GuildUserFormValues) {
  return props.submit(data);
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="mode === 'create' ? '新增用户' : '编辑用户'"
    width="500px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <GuildUserForm
        :initial-data="initialData"
        :submit="handleSubmit"
        @cancel="handleClose"
      />
    </ElScrollbar>
  </ElDialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}

/* .description {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 6px 16px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  font-size: 14px;
} */
</style>
