<script setup lang="ts">
import type { OrganizationItem } from '@tk-crawler/biz-shared';
import { ElDialog, ElScrollbar } from 'element-plus';
import OrgForm from './org-form.vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  visible: boolean;
  submit: (data: Partial<OrganizationItem>) => Promise<void>;
  initialData?: Partial<OrganizationItem>;
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
    :title="mode === 'create' ? '新增机构' : '编辑机构'"
    width="650px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <OrgForm
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
