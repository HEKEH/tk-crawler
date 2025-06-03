<script setup lang="ts">
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInputNumber,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { computed, reactive, ref } from 'vue';

const props = defineProps<{
  initialData?: { base_price: number; follow_price: number };
  submit: (data: { base_price: number; follow_price: number }) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  base_price: props.initialData?.base_price ?? 1000,
  follow_price: props.initialData?.follow_price ?? 200,
});

const rules = computed<FormRules>(() => {
  return {
    base_price: [{ required: true, message: '请输入基础套餐价格' }],
    follow_price: [{ required: true, message: '请输入自动关注功能的价格' }],
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
          base_price: form.base_price!,
          follow_price: form.follow_price!,
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
    label-width="120px"
    label-position="right"
  >
    <ElFormItem label="基础套餐价格" prop="base_price">
      <ElInputNumber
        v-model="form.base_price"
        style="width: 100%"
        :precision="0"
        :step="50"
        :min="0"
      />
    </ElFormItem>
    <ElFormItem label="自动关注功能价格" prop="follow_price">
      <ElInputNumber
        v-model="form.follow_price"
        style="width: 100%"
        :precision="0"
        :step="50"
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
