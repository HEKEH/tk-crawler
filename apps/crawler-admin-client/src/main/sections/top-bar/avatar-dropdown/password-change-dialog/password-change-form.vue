<script setup lang="ts">
import { validatePassword } from '@tk-crawler/biz-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

export interface PasswordChangeFormValues {
  old_password: string;
  new_password: string;
  password_confirm: string;
}

const props = defineProps<{
  submit: (data: Omit<PasswordChangeFormValues, 'password_confirm'>) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive<PasswordChangeFormValues>({
  old_password: '',
  new_password: '',
  password_confirm: '',
});

const rules: FormRules = {
  old_password: [{ required: true, message: '请输入当前密码' }],
  new_password: [
    { required: true, message: '请输入新密码' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        const result = validatePassword(value);
        if (!result.isValid) {
          callback(new Error(result.error));
        } else {
          callback();
        }
      },
    },
  ],
  password_confirm: [
    { required: true, message: '请确认新密码' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.new_password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
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
          old_password: form.old_password,
          new_password: form.new_password,
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
    <ElFormItem label="当前密码" prop="old_password">
      <ElInput
        v-model="form.old_password"
        type="password"
        placeholder="请输入当前密码"
        show-password
      />
    </ElFormItem>

    <ElFormItem label="新密码" prop="new_password">
      <ElInput
        v-model="form.new_password"
        type="password"
        placeholder="请输入新密码"
        show-password
      />
    </ElFormItem>

    <ElFormItem label="确认密码" prop="password_confirm">
      <ElInput
        v-model="form.password_confirm"
        type="password"
        placeholder="请再次输入新密码"
        show-password
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
