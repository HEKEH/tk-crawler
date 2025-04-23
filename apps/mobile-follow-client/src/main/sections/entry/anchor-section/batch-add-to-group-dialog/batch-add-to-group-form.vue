<script setup lang="ts">
import {
  ElButton,
  ElForm,
  ElFormItem,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';
import { AnchorFollowGroupSelect } from '../../../../components';
import { useGlobalStore } from '../../../../utils/vue';

export interface BatchAddToGroupFormValues {
  group_id: string;
}

const props = defineProps<{
  initialData?: Partial<BatchAddToGroupFormValues>;
  submit: (data: BatchAddToGroupFormValues) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const globalStore = useGlobalStore();

const formRef = ref<FormInstance>();

const form = reactive<BatchAddToGroupFormValues>({
  group_id: props.initialData?.group_id || '',
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入组名' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符' },
    {
      validator: (rule, value, callback) => {
        if (value && value.includes(' ')) {
          callback(new Error('名字不要有空格'));
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
          group_id: form.group_id,
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
    <ElFormItem label="选择分组" prop="group_id">
      <AnchorFollowGroupSelect
        v-model="form.group_id"
        :org-id="globalStore.orgId"
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
