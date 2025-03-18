<script setup lang="ts">
import type {
  AnchorFrom87,
  CreateAnchorFollowGroupRequest,
} from '@tk-crawler/biz-shared';
import type { CreateGroupFormValues } from './create-group-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import CreateGroupForm from './create-group-form.vue';

const props = defineProps<{
  visible: boolean;
  anchors: AnchorFrom87[];
  submit: (
    data: Omit<CreateAnchorFollowGroupRequest, 'org_id'>,
  ) => Promise<void>;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  emit('close');
}

function handleSubmit(data: CreateGroupFormValues) {
  return props.submit({
    ...data,
    anchor_table_ids: props.anchors.map(item => item.id),
  });
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
      <div class="description">共选中 {{ props.anchors.length }} 个主播</div>
      <CreateGroupForm :submit="handleSubmit" @cancel="handleClose" />
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
