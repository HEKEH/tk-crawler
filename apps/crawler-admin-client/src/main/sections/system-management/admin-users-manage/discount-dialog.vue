<script setup lang="ts">
import { ElDialog, ElScrollbar } from 'element-plus';
import DiscountForm from './discount-form.vue';

const props = defineProps<{
  visible: boolean;
  submit: (data: { discount: number }) => Promise<void>;
  initialData?: { discount: number };
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
    title="调整折扣"
    width="350px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <DiscountForm
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
