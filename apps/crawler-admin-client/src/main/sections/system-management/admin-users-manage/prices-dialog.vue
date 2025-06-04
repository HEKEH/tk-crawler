<script setup lang="ts">
import { ElDialog, ElScrollbar } from 'element-plus';
import PricesForm from './prices-form.vue';

const props = defineProps<{
  visible: boolean;
  submit: (data: { base_price: number; follow_price: number }) => Promise<void>;
  initialData?: { base_price: number; follow_price: number };
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
    title="调整单价"
    width="400px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <PricesForm
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
