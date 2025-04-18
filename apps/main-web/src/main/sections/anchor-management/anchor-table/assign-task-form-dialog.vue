<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { AssignTaskFormValues } from './assign-task-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import AssignTaskForm from './assign-task-form.vue';

const props = defineProps<{
  visible: boolean;
  anchors: Pick<DisplayedAnchorItem, 'id' | 'display_id'>[];
  submit: (data: AssignTaskFormValues) => Promise<void>;
  initialData?: Partial<AssignTaskFormValues>;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  emit('close');
}

function handleSubmit(data: AssignTaskFormValues) {
  return props.submit(data);
}

// const warningText = '不选择则清除分配';
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="主播分配"
    width="500px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <div v-if="anchors.length === 1" class="description">
        {{ `将主播「${anchors[0].display_id}」分配给用户` }}
      </div>
      <div v-else-if="anchors.length > 1" class="description">
        {{ `将 ${anchors.length} 个主播分配给用户` }}
      </div>
      <AssignTaskForm
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

.warning-text {
  color: var(--el-color-danger);
}
</style>
