<script setup lang="ts">
import type { SettingFormValues } from './setting-form.vue';
import { ElDialog, ElScrollbar } from 'element-plus';
import SettingForm from './setting-form.vue';

const props = defineProps<{
  visible: boolean;
  initialValues: SettingFormValues;
  submit: (data: SettingFormValues) => Promise<void> | void;
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
    title="设置"
    width="500px"
    destroy-on-close
    append-to-body
    @close="handleClose"
  >
    <ElScrollbar>
      <SettingForm
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
