<script setup lang="ts">
import { computeCharge } from '@tk-crawler/biz-shared';
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
import { computed, reactive, ref } from 'vue';
import { useGlobalStore } from '../../../utils';

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

const globalStore = useGlobalStore();

const isWeb = useIsWebSize();

const formRef = ref<FormInstance>();

const form = reactive<FormValues>({
  type: 'add',
  unit: 'month',
  membership_value: 1,
});

const needToCharge = computed(() => {
  return globalStore.userProfile.needToCharge;
});

const membershipDays = computed(() => {
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
  return membership_days;
});

function getMembershipCharge(days: number) {
  return needToCharge.value
    ? computeCharge({
        membershipDays: days,
        basePrice: globalStore.userProfile.chargeBasePrice,
      })
    : 0;
}

const membershipCharge = computed(() => {
  return getMembershipCharge(membershipDays.value);
});

const rules: FormRules = {
  membership_value: [
    { required: true, message: '请输入数值', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (
          needToCharge.value &&
          membershipCharge.value > globalStore.userProfile.balance!
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
        await props.submit({ membership_days: membershipDays.value });
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
function validateMembershipValue() {
  formRef.value?.validateField('membership_value');
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
    <ElFormItem required label="类型" prop="type">
      <ElRadioGroup v-model="form.type" @change="validateMembershipValue">
        <ElRadio label="加时" value="add" />
        <ElRadio label="扣时" value="minus" />
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem required label="单位" prop="unit">
      <ElRadioGroup v-model="form.unit" @change="validateMembershipValue">
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
      <div v-if="needToCharge" class="membership-charge">
        <span
          >当前余额: {{ globalStore.userProfile.balance?.toFixed(2) }}元</span
        >
        <span v-if="form.type === 'add'"
          >会员费用: {{ membershipCharge.toFixed(2) }}元</span
        >
        <span v-else>退费: {{ (-membershipCharge).toFixed(2) }}元</span>
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
  column-gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
  @include mobile {
    column-gap: 6px;
    font-size: 0.75rem;
  }
}
</style>
