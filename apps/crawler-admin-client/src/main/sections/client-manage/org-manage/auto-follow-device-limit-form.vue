<script setup lang="ts">
import {
  computeChargeByDevicesChange,
  computeRemainingMembershipDays,
} from '@tk-crawler/biz-shared';
import { transformStringToDate } from '@tk-crawler/shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInputNumber,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { useGlobalStore } from '../../../utils';

export interface FormValues {
  auto_follow_device_limit: number;
}

const props = defineProps<{
  membershipExpireAt: string | Date | null;
  initialValues: FormValues;
  submit: (data: FormValues) => void;
}>();

const emit = defineEmits<{
  cancel: [];
}>();

const globalStore = useGlobalStore();

const isWeb = useIsWebSize();

const formRef = ref<FormInstance>();

const form = reactive<FormValues>({
  auto_follow_device_limit: props.initialValues.auto_follow_device_limit,
});

const needToCharge = computed(() => {
  return globalStore.userProfile.needToCharge;
});

const membershipExpireAt = computed(() => {
  if (!props.membershipExpireAt) {
    return null;
  }
  if (typeof props.membershipExpireAt === 'string') {
    return transformStringToDate(props.membershipExpireAt);
  }
  return props.membershipExpireAt;
});

const remainingMembershipDays = computed(() => {
  if (!membershipExpireAt.value) {
    return 0;
  }
  return computeRemainingMembershipDays(membershipExpireAt.value);
});

function getCharge(auto_follow_device_limit: number) {
  return needToCharge.value && membershipExpireAt.value
    ? computeChargeByDevicesChange({
        followPrice: globalStore.userProfile.chargeFollowPrice,
        oldDevices: props.initialValues.auto_follow_device_limit,
        newDevices: auto_follow_device_limit,
        membershipExpireAt: membershipExpireAt.value,
      })
    : 0;
}

const charge = computed(() => {
  return getCharge(form.auto_follow_device_limit);
});

const rules: FormRules = {
  auto_follow_device_limit: [
    { required: true, message: '请输入数值', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (
          needToCharge.value &&
          charge.value > globalStore.userProfile.balance!
        ) {
          callback(new Error('当前余额不足'));
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
          auto_follow_device_limit: form.auto_follow_device_limit,
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
    :label-width="isWeb ? '60px' : '40px'"
    label-position="right"
  >
    <ElFormItem label="数值" prop="auto_follow_device_limit">
      <ElInputNumber
        v-model="form.auto_follow_device_limit"
        :precision="0"
        :step="1"
        :min="0"
        placeholder="请输入"
      />
      <div v-if="needToCharge" class="membership-charge">
        <span
          >当前余额: {{ globalStore.userProfile.balance?.toFixed(2) }}元</span
        >
        <span v-if="charge >= 0">费用: {{ charge.toFixed(2) }}元</span>
        <span v-else>退费: {{ (-charge).toFixed(2) }}元</span>
        <span>(根据{{ remainingMembershipDays }}天剩余会员时长计算)</span>
      </div>
    </ElFormItem>

    <ElFormItem>
      <ElButton type="primary" :loading="isLoading" @click="handleSubmit">
        保存
      </ElButton>
      <ElButton @click="handleCancel">取消</ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style lang="scss" scoped>
.el-form {
  max-width: 600px;
  margin: 0 auto;
}
.membership-charge {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
  @include mobile {
    column-gap: 6px;
    font-size: 0.75rem;
  }
}
</style>
