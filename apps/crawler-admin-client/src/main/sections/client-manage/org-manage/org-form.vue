<script setup lang="ts">
import {
  type OrganizationItem,
  OrganizationStatus,
} from '@tk-crawler/biz-shared';
import { CommonDatePickerShortcuts, isArrayEqual } from '@tk-crawler/shared';
import { AreaSelectMultiple } from '@tk-crawler/view-shared';
import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessageBox,
  ElOption,
  ElSelect,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

const props = defineProps<{
  initialData?: Partial<OrganizationItem>;
  submit: (data: Partial<OrganizationItem>) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  ...props.initialData,
  membership_start_at: props.initialData?.membership_start_at ?? undefined,
  membership_expire_at: props.initialData?.membership_expire_at ?? undefined,
  status: props.initialData?.status ?? OrganizationStatus.normal,
});

const statusOptions = [
  { label: '正常', value: OrganizationStatus.normal },
  { label: '禁用', value: OrganizationStatus.disabled },
];

const rules: FormRules = {
  name: [
    { required: true, message: '请输入机构名称' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符' },
  ],
  status: [{ required: true, message: '请选择状态' }],
  regions: [{ required: true, message: '请选择地区' }],
  membershipDates: [
    {
      validator: (rule, value, callback) => {
        if (form.membership_expire_at && form.membership_start_at) {
          if (
            dayjs(form.membership_expire_at).isBefore(form.membership_start_at)
          ) {
            callback(new Error('到期时间不能早于开始时间'));
          }
        } else if (form.membership_expire_at && !form.membership_start_at) {
          callback(new Error('已选择到期时间，开始时间不能为空'));
        } else if (!form.membership_expire_at && form.membership_start_at) {
          callback(new Error('已选择开始时间，到期时间不能为空'));
        }
        callback();
      },
    },
  ],
};

function disablePastDates(time: Date, startDate?: Date | null) {
  if (startDate && time) {
    return dayjs(time).isBefore(startDate);
  }
  return dayjs(time).isBefore(dayjs(), 'day');
}

const isLoading = ref(false);

async function handleSubmit() {
  if (!formRef.value || isLoading.value) {
    return;
  }

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      isLoading.value = true;
      try {
        const toDisable =
          props.initialData?.status === OrganizationStatus.normal &&
          form.status === OrganizationStatus.disabled;
        if (toDisable) {
          try {
            await ElMessageBox.confirm('确定要禁用该机构吗？', {
              type: 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '取消',
            });
          } catch {
            return;
          }
        }
        // 如果地区没有变化，则不提交地区，以免浪费资源
        const regions = isArrayEqual(
          form.regions || [],
          props.initialData?.regions || [],
        )
          ? undefined
          : form.regions;
        await props.submit({
          name: form.name,
          status: form.status,
          regions,
          membership_start_at: form.membership_start_at ?? null,
          membership_expire_at: form.membership_expire_at ?? null,
          remark: form.remark,
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
    <ElFormItem label="机构名称" prop="name">
      <ElInput v-model="form.name" placeholder="请输入机构名称" />
    </ElFormItem>

    <ElFormItem label="会员时间" prop="membershipDates">
      <ElDatePicker
        v-model="form.membership_start_at"
        type="datetime"
        placeholder="开始时间"
        format="YYYY-MM-DD HH:mm:ss"
        :disabled-date="disablePastDates"
        style="margin-right: 10px"
      />
      <ElDatePicker
        v-model="form.membership_expire_at"
        type="datetime"
        placeholder="到期时间"
        format="YYYY-MM-DD HH:mm:ss"
        :disabled-date="
          (time: Date) => disablePastDates(time, form.membership_start_at)
        "
        :shortcuts="CommonDatePickerShortcuts"
      />
    </ElFormItem>

    <ElFormItem label="区域" prop="areas">
      <AreaSelectMultiple v-model="form.areas" :show-all="false" />
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

    <ElFormItem label="备注" prop="remark">
      <ElInput
        v-model="form.remark"
        type="textarea"
        :rows="3"
        resize="none"
        placeholder="请输入备注"
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
