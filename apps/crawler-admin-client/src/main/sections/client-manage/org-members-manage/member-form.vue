<script setup lang="ts">
import {
  type OrgMemberItem,
  OrgMemberRole,
  OrgMemberStatus,
  validatePassword,
} from '@tk-crawler/biz-shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
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

const props = defineProps<{
  mode: 'create' | 'edit';
  initialData?: Partial<OrgMemberItem>;
  submit: (data: Partial<OrgMemberItem>) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const isWeb = useIsWebSize();

const formRef = ref<FormInstance>();

const form = reactive({
  ...props.initialData,
  status: props.initialData?.status ?? OrgMemberStatus.normal,
  role_id: props.initialData?.role_id ?? OrgMemberRole.admin,
});

const statusOptions = [
  { label: '正常', value: OrgMemberStatus.normal },
  { label: '禁用', value: OrgMemberStatus.disabled },
];

const roleOptions = [
  { label: '管理员', value: OrgMemberRole.admin },
  { label: '普通用户', value: OrgMemberRole.member },
];

const rules = computed<FormRules>(() => {
  return {
    username: [
      { required: true, message: '请输入登录名' },
      { min: 2, max: 24, message: '长度在 2 到 24 个字符' },
      {
        validator: (rule, value, callback) => {
          if (value && value.includes(' ')) {
            callback(new Error('名字不要有空格'));
          }
          callback();
        },
      },
    ],
    display_name: [
      { required: true, message: '请输入显示名' },
      { min: 2, max: 24, message: '长度在 2 到 24 个字符' },
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
    email: [{ type: 'email', message: '请输入正确的邮箱地址' }],
    mobile: [{ pattern: /^[1-9]\d{5,14}$/, message: '请输入正确的手机号' }],
    role_id: [{ required: true, message: '请选择角色' }],
    status: [{ required: true, message: '请选择状态' }],
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
          display_name: form.display_name,
          password: form.password,
          email: form.email || null,
          mobile: form.mobile || null,
          role_id: form.role_id,
          status: form.status,
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
    :size="isWeb ? 'default' : 'small'"
    :model="form"
    :rules="rules"
    :label-width="isWeb ? '120px' : '80px'"
    label-position="right"
  >
    <ElFormItem label="登录名" prop="username">
      <ElInput
        v-model="form.username"
        placeholder="请输入登录名"
        :disabled="!!props.initialData?.id"
      />
    </ElFormItem>

    <ElFormItem label="显示名" prop="display_name">
      <ElInput v-model="form.display_name" placeholder="请输入显示名" />
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

    <ElFormItem label="邮箱" prop="email">
      <ElInput v-model="form.email" placeholder="请输入邮箱" />
    </ElFormItem>

    <ElFormItem label="手机号" prop="mobile">
      <ElInput v-model="form.mobile" placeholder="请输入手机号" />
    </ElFormItem>

    <ElFormItem label="角色" prop="role_id">
      <ElSelect v-model="form.role_id" placeholder="请选择角色">
        <ElOption
          v-for="item in roleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="状态" prop="status">
      <ElSelect v-model="form.status" placeholder="请选择状态">
        <ElOption
          v-for="item in statusOptions"
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
