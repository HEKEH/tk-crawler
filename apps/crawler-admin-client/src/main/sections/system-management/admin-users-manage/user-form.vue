<script setup lang="ts">
import {
  ADMIN_USER_ROLE_OPTIONS,
  type SystemAdminUserInfo,
  SystemAdminUserRole,
  validatePassword,
} from '@tk-crawler/biz-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { useGlobalStore } from '../../../utils';

const props = defineProps<{
  mode: 'create' | 'edit';
  initialData?: Partial<SystemAdminUserInfo>;
  submit: (data: Partial<SystemAdminUserInfo>) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const globalStore = useGlobalStore();

const formRef = ref<FormInstance>();

const form = reactive({
  ...props.initialData,
  role_id: props.initialData?.role_id ?? SystemAdminUserRole.USER,
});

const rules = computed<FormRules>(() => {
  return {
    username: [
      { required: true, message: '请输入登录名' },
      { min: 2, max: 24, message: '长度在 2 到 24 个字符' },
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
    password: [
      {
        required: props.mode === 'create',
        message: '请输入密码',
      },
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
    role_id: [{ required: true, message: '请选择角色' }],
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
          username: form.username,
          password: form.password || undefined,
          role_id: form.role_id,
          id: props.initialData?.id,
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
    <ElFormItem label="登录名" prop="username">
      <ElInput
        v-model="form.username"
        placeholder="请输入登录名"
        :disabled="!!props.initialData?.id"
      />
    </ElFormItem>

    <ElFormItem
      label="密码"
      prop="password"
      :required="props.mode === 'create'"
    >
      <ElInput
        v-model="form.password"
        type="password"
        :placeholder="props.mode === 'create' ? '请输入密码' : '留空则不修改'"
        show-password
      />
    </ElFormItem>
    <ElFormItem label="角色" prop="role_id">
      <ElSelect
        v-model="form.role_id"
        placeholder="请选择角色"
        :disabled="props.initialData?.id === globalStore.userProfile.userId"
      >
        <ElOption
          v-for="item in ADMIN_USER_ROLE_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
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
  max-width: 600px;
  margin: 0 auto;
}
</style>
