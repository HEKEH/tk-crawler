<script setup lang="ts">
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElRadio,
  ElRadioGroup,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { computed, reactive, ref } from 'vue';

const props = defineProps<{
  currentBalance?: number;
  submit: (data: { amount: number }) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive<{
  type: 'add' | 'minus';
  amount?: number;
}>({
  type: 'add',
});

const rules = computed<FormRules>(() => {
  return {
    amount: [
      { required: true, message: '请输入金额' },
      {
        validator: (rule, value, callback) => {
          if (
            form.type === 'minus' &&
            props.currentBalance &&
            value > props.currentBalance
          ) {
            callback(new Error('扣减金额不能大于当前余额'));
            return;
          }
          callback();
        },
      },
    ],
  };
});

const isLoading = ref(false);

async function handleSubmit() {
  if (!formRef.value || isLoading.value) {
    return;
  }

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      isLoading.value = true;
      try {
        await props.submit({
          amount: form.type === 'add' ? form.amount! : -form.amount!,
        });
      } finally {
        isLoading.value = false;
      }
    } else {
      console.error('表单验证失败:', fields);
    }
  });
}

function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <ElForm
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
    label-position="right"
  >
    <ElFormItem v-if="currentBalance !== undefined" label="当前余额">
      {{ `${currentBalance.toFixed(2)} 元` }}
    </ElFormItem>
    <ElFormItem required label="类型" prop="type">
      <ElRadioGroup v-model="form.type">
        <ElRadio label="充值" value="add" />
        <ElRadio label="扣减" value="minus" />
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem label="金额" prop="amount">
      <ElInputNumber
        v-model="form.amount"
        style="width: 100%"
        :step="1000"
        :min="0"
      />
    </ElFormItem>
    <ElFormItem>
      <ElButton type="primary" :loading="isLoading" @click="handleSubmit">
        保存
      </ElButton>
      <ElButton @click="handleCancel">取消</ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style scoped>
.el-form {
  max-width: 300px;
  margin: 0 auto;
}
</style>
