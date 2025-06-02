<script setup lang="ts">
import type { AnchorCommentTemplateGroup } from '@tk-crawler/biz-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

export interface TemplateGroupFormValues {
  name: string;
}

const props = defineProps<{
  initialData?: Partial<AnchorCommentTemplateGroup>;
  submit: (data: TemplateGroupFormValues) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  ...props.initialData,
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入模板组名' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符' },
    {
      validator: (rule, value, callback) => {
        if (value && value.includes(' ')) {
          callback(new Error('名字不要有空格'));
          return;
        }
        callback();
      },
    },
  ],
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
          name: form.name!,
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
    <ElFormItem label="模板组名" prop="name">
      <ElInput v-model="form.name" placeholder="请输入模板组名" />
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
