<script setup lang="ts">
import type { OrgMemberItem } from '@tk-crawler/biz-shared';
import { ElDialog, ElScrollbar } from 'element-plus';
import MemberForm from './member-form.vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  visible: boolean;
  submit: (data: Partial<OrgMemberItem>) => Promise<void>;
  initialData?: Partial<OrgMemberItem>;
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
    :title="mode === 'create' ? '新增成员' : '编辑成员信息'"
    width="650px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <MemberForm
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
