<script setup lang="ts">
import { RangeNumberInput, useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

export interface SettingFormValues {
  error_sound_time: [number, number] | undefined;
}

const props = defineProps<{
  initialValues: SettingFormValues;
  submit: (data: SettingFormValues) => void | Promise<void>;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive<SettingFormValues>(props.initialValues);

const rules: FormRules = {
  error_sound_time: [
    {
      validator: (rule, value, callback) => {
        const isStartTimeNumber = typeof value[0] === 'number';
        const isEndTimeNumber = typeof value[1] === 'number';
        if (isStartTimeNumber && !isEndTimeNumber) {
          callback(new Error('请输入结束时间，或者清空开始时间'));
        } else if (!isStartTimeNumber && isEndTimeNumber) {
          callback(new Error('请输入开始时间，或者清空结束时间'));
        } else {
          callback();
        }
        // else if (
        //   isStartTimeNumber &&
        //   isEndTimeNumber &&
        //   value[0] > value[1]
        // ) {
        //   callback(new Error('开始时间不能大于结束时间'));
        // }
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
        const errorSoundTime = form.error_sound_time;
        const isStartTimeNumber = typeof errorSoundTime?.[0] === 'number';
        const isEndTimeNumber = typeof errorSoundTime?.[1] === 'number';
        if (isStartTimeNumber && isEndTimeNumber) {
          await props.submit({
            error_sound_time: form.error_sound_time,
          });
        } else {
          await props.submit({
            error_sound_time: undefined,
          });
        }
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
const isWebSize = useIsWebSize();
</script>

<template>
  <ElForm
    ref="formRef"
    :model="form"
    :rules="rules"
    :size="isWebSize ? 'default' : 'small'"
    label-position="right"
  >
    <ElFormItem
      label="错误声音播放时间"
      prop="error_sound_time"
      label-position="top"
    >
      <RangeNumberInput
        v-model="form.error_sound_time"
        :min="0"
        :max="24"
        :step="1"
        :size="isWebSize ? 'default' : 'small'"
        start-label="开始小时"
        end-label="结束小时"
        start-placeholder="请输入"
        end-placeholder="请输入"
        :precision="0"
      />
    </ElFormItem>

    <ElFormItem class="flex justify-center">
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
