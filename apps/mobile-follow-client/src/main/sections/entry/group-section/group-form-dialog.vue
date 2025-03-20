<script setup lang="ts">
import type { GroupFormValues } from '../anchor-section/group-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import GroupForm from '../anchor-section/group-form.vue';

const props = defineProps<{
  visible: boolean;
  submit: (data: GroupFormValues) => Promise<void>;
  initialData?: Partial<GroupFormValues>;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  emit('close');
}

function handleSubmit(data: GroupFormValues) {
  return props.submit(data);
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="新增分组"
    width="500px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <GroupForm
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

.description {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 6px 16px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  font-size: 14px;
}
</style>
