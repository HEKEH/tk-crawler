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
  initialData?: { discount: number };
  submit: (data: { discount: number }) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  discount: props.initialData?.discount ?? 1,
});

const rules = computed<FormRules>(() => {
  return {
    discount: [{ required: true, message: '请输入折扣' }],
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
          discount: form.discount,
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
    <ElFormItem label="折扣" prop="discount">
      <ElInputNumber
        v-model="form.discount"
        style="width: 100%"
        :precision="2"
        :step="0.05"
        :min="0.1"
        :max="1"
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
