<script setup lang="ts">
import { useIsWebSize } from '@tk-crawler/view-shared';
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
import { reactive, ref } from 'vue';

interface FormValues {
  type: 'add' | 'minus';
  unit: 'day' | 'week' | 'month' | 'year';
  membership_value: number;
}

const props = defineProps<{
  submit: (data: { membership_days: number }) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const isWeb = useIsWebSize();

const formRef = ref<FormInstance>();

const form = reactive<FormValues>({
  type: 'add',
  unit: 'month',
  membership_value: 1,
});

const rules: FormRules = {
  membership_value: [
    { required: true, message: '请输入数值', trigger: 'blur' },
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
        let membership_days = form.membership_value;
        if (form.unit === 'week') {
          membership_days *= 7;
        } else if (form.unit === 'month') {
          membership_days *= 30;
        } else if (form.unit === 'year') {
          membership_days *= 360;
        }
        if (form.type === 'minus') {
          membership_days = -membership_days;
        }
        await props.submit({ membership_days });
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
    :label-width="isWeb ? '80px' : '60px'"
    label-position="right"
  >
    <ElFormItem required label="类型" prop="type">
      <ElRadioGroup v-model="form.type">
        <ElRadio label="加时" value="add" />
        <ElRadio label="扣时" value="minus" />
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem required label="单位" prop="unit">
      <ElRadioGroup v-model="form.unit">
        <ElRadio label="天" value="day" />
        <ElRadio label="周" value="week" />
        <ElRadio label="月" value="month" />
        <ElRadio label="年" value="year" />
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem label="数值" prop="membership_value">
      <ElInputNumber
        v-model="form.membership_value"
        :min="1"
        placeholder="请输入"
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
