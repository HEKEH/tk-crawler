<script setup lang="ts">
import { ElDialog, ElScrollbar } from 'element-plus';
import BalanceForm from './balance-form.vue';

const props = defineProps<{
  visible: boolean;
  currentBalance?: number;
  submit: (data: { amount: number }) => Promise<void>;
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
    title="充值"
    width="350px"
    destroy-on-close
    @close="handleClose"
  >
    <ElScrollbar>
      <BalanceForm
        :current-balance="props.currentBalance"
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
