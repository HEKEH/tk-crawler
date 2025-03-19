<script setup lang="ts">
import type { AnchorCommentTemplateGroup } from '@tk-crawler/biz-shared';
import type { TemplateGroupFormValues } from './template-group-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import TemplateGroupForm from './template-group-form.vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  visible: boolean;
  submit: (data: Partial<AnchorCommentTemplateGroup>) => Promise<void>;
  initialData?: Partial<AnchorCommentTemplateGroup>;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  emit('close');
}

function handleSubmit(data: TemplateGroupFormValues) {
  return props.submit(data);
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="mode === 'create' ? '新增模板组' : '编辑模板组'"
    width="500px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <TemplateGroupForm
        :mode="mode"
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
