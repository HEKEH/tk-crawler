<script setup lang="ts">
import { ElDialog, ElScrollbar } from 'element-plus';
import OrgMembershipForm from './org-membership-form.vue';

const props = defineProps<{
  visible: boolean;
  submit: (data: { membership_days: number }) => Promise<void>;
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
    title="新增或延长会员"
    width="400px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <OrgMembershipForm :submit="props.submit" @cancel="handleClose" />
    </ElScrollbar>
  </ElDialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
