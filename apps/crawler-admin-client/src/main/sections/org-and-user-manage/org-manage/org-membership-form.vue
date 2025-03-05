<script setup lang="ts">
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInputNumber,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

const props = defineProps<{
  submit: (data: { membership_days: number }) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  membership_days: 30,
});

const rules: FormRules = {
  membership_days: [
    { required: true, message: '请输入会员天数', trigger: 'blur' },
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
          membership_days: form.membership_days,
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
    <ElFormItem label="会员天数" prop="membership_days">
      <ElInputNumber
        v-model="form.membership_days"
        :min="1"
        :max="365"
        placeholder="请输入会员天数"
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
  max-width: 600px;
  margin: 0 auto;
}
</style>
