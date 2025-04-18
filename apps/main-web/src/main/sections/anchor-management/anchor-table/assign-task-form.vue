<script setup lang="ts">
import {
  ElButton,
  ElForm,
  ElFormItem,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';
import { OrgMemberSelectSingle } from '../../../components';

export interface AssignTaskFormValues {
  orgMemberId: string;
}

const props = defineProps<{
  initialData?: Partial<AssignTaskFormValues>;
  submit: (data: AssignTaskFormValues) => void;
}>();
const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive<Partial<AssignTaskFormValues>>({
  orgMemberId: props.initialData?.orgMemberId,
});

const rules: FormRules = {
  orgMemberId: [{ required: true, message: '请选择用户' }],
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
          orgMemberId: form.orgMemberId!,
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
    <ElFormItem label="选择用户" prop="orgMemberId">
      <OrgMemberSelectSingle v-model="form.orgMemberId" />
    </ElFormItem>
    <ElFormItem class="buttons-row">
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

.buttons-row {
  margin-top: 1.5rem;
}
</style>
