<script setup lang="ts">
import type { AnchorCommentTemplate } from '@tk-crawler/biz-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

export interface TemplateFormValues {
  label: string | null;
  content: string;
}

const props = defineProps<{
  initialData?: Partial<AnchorCommentTemplate>;
  submit: (data: TemplateFormValues) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  ...props.initialData,
});

const rules: FormRules = {
  label: [
    {
      min: 2,
      max: 24,
      message: '长度在 2 到 24 个字符',
    },
  ],
  content: [{ required: true, message: '请输入内容' }],
};

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
          label: form.label?.trim() || null,
          content: form.content!,
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
    label-width="100px"
    label-position="right"
  >
    <ElFormItem label="标题(可选)" prop="label">
      <ElInput v-model="form.label" placeholder="请输入标题" />
    </ElFormItem>

    <ElFormItem label="模板内容" prop="content">
      <ElInput
        v-model="form.content"
        type="textarea"
        :rows="5"
        resize="none"
        placeholder="请输入模板内容"
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
  width: 100%;
  margin: 0 auto;
}
</style>
