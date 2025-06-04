<script setup lang="ts">
import type { FormValues } from './auto-follow-device-limit-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import AutoFollowDeviceLimitForm from './auto-follow-device-limit-form.vue';

const props = defineProps<{
  visible: boolean;
  membershipExpireAt: string | Date | null;
  initialValues: FormValues;
  submit: (data: FormValues) => void;
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
    title="自动建联设备数量调整"
    width="400px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <AutoFollowDeviceLimitForm
        :membership-expire-at="props.membershipExpireAt"
        :initial-values="props.initialValues"
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
