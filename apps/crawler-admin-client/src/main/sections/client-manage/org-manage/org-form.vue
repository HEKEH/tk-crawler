<script setup lang="ts">
import {
  computeCharge,
  type OrganizationItem,
  OrganizationStatus,
} from '@tk-crawler/biz-shared';
import { isArrayEqual } from '@tk-crawler/shared';
import { AreaSelectMultiple, useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessageBox,
  ElOption,
  ElSelect,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { useGlobalStore } from '../../../utils';

type FormValues = Partial<OrganizationItem> & {
  membership_days?: number;
};

const props = defineProps<{
  initialData?: FormValues;
  areasLimit?: number;
  submit: (data: FormValues) => void;
}>();

const emit = defineEmits(['cancel']);

const globalStore = useGlobalStore();

const needToCharge = computed(() => {
  return globalStore.userProfile.needToCharge;
});

const mode = computed(() => {
  return props.initialData ? 'edit' : 'create';
});

const isWeb = useIsWebSize();

const formRef = ref<FormInstance>();

const form = reactive<FormValues>({
  ...props.initialData,
  mobile_device_limit: props.initialData?.mobile_device_limit ?? 0,
  status: props.initialData?.status ?? OrganizationStatus.normal,
});

function getMembershipCharge(membershipDays: number) {
  return needToCharge.value
    ? computeCharge({
        membershipDays,
        basePrice: globalStore.userProfile.chargeBasePrice,
        followPrice: globalStore.userProfile.chargeFollowPrice,
        followDevices: form.mobile_device_limit ?? 0,
      })
    : 0;
}

const membershipCharge = computed(() => {
  return getMembershipCharge(form.membership_days ?? 0);
});

const statusOptions = [
  { label: '正常', value: OrganizationStatus.normal },
  { label: '禁用', value: OrganizationStatus.disabled },
];

const rules: FormRules = {
  name: [
    { required: true, message: '请输入机构名称' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符' },
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
  fee: [
    {
      validator: (rule, value, callback) => {
        if (mode.value === 'edit') {
          callback();
          return;
        }
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
  status: [{ required: true, message: '请选择状态' }],
  mobile_device_limit: [{ required: true, message: '请输入设备数量上限' }],
  areas: [
    { required: true, message: '请选择分区' },
    {
      validator: (rule, value, callback) => {
        if (props.areasLimit && value && value.length > props.areasLimit) {
          callback(
            new Error(`您权限不足，最多只能选择${props.areasLimit}个分区`),
          );
          return;
        }
        callback();
      },
    },
  ],
  // membershipDates: [
  //   {
  //     validator: (rule, value, callback) => {
  //       if (form.membership_expire_at && form.membership_start_at) {
  //         if (
  //           dayjs(form.membership_expire_at).isBefore(form.membership_start_at)
  //         ) {
  //           callback(new Error('到期时间不能早于开始时间'));
  //         }
  //       } else if (form.membership_expire_at && !form.membership_start_at) {
  //         callback(new Error('已选择到期时间，开始时间不能为空'));
  //       } else if (!form.membership_expire_at && form.membership_start_at) {
  //         callback(new Error('已选择开始时间，到期时间不能为空'));
  //       }
  //       callback();
  //     },
  //   },
  // ],
};

// function disablePastDates(time: Date, startDate?: Date | null) {
//   if (startDate && time) {
//     return dayjs(time).isBefore(startDate);
//   }
//   return dayjs(time).isBefore(dayjs(), 'day');
// }

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
        const areas = isArrayEqual(
          form.areas || [],
          props.initialData?.areas || [],
        )
          ? undefined
          : form.areas;
        await props.submit({
          name: form.name,
          status: form.status,
          areas,
          mobile_device_limit: form.mobile_device_limit,
          membership_days: form.membership_days,
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
async function validateFee() {
  try {
    await formRef.value?.validateField('fee');
  } catch (error) {
    console.error('fee', error);
  }
}
</script>

<template>
  <ElForm
    ref="formRef"
    :model="form"
    :rules="rules"
    :size="isWeb ? 'default' : 'small'"
    :label-width="isWeb ? '140px' : '120px'"
    label-position="right"
  >
    <ElFormItem label="机构名称" prop="name">
      <ElInput v-model="form.name" placeholder="请输入机构名称" />
    </ElFormItem>

    <!-- <ElFormItem
      class="membership-dates-item"
      label="会员时间"
      prop="membershipDates"
    >
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
    </ElFormItem> -->

    <ElFormItem label="分区" prop="areas">
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

    <ElFormItem
      v-if="mode === 'create'"
      label="会员天数"
      prop="membership_days"
    >
      <div class="membership-days-input">
        <div class="input-with-unit">
          <ElInputNumber
            v-model="form.membership_days"
            style="width: 100%"
            :precision="0"
            :controls="false"
            :min="1"
          />
          <!-- <span class="unit">天</span> -->
        </div>
        <div class="quick-options">
          <ElButton
            v-for="days in isWeb ? [3, 7, 30, 90, 180] : [3, 7, 30]"
            :key="days"
            size="small"
            :type="form.membership_days === days ? 'primary' : 'default'"
            @click="
              form.membership_days = days;
              validateFee();
            "
          >
            {{ days }}天
          </ElButton>
          <ElButton
            size="small"
            type="text"
            @click="
              form.membership_days = undefined;
              validateFee();
            "
          >
            清空
          </ElButton>
        </div>
      </div>
    </ElFormItem>

    <ElFormItem
      v-if="mode === 'create'"
      label="自动建联设备数量"
      prop="mobile_device_limit"
    >
      <ElInputNumber
        v-model="form.mobile_device_limit"
        style="width: 100%"
        :precision="0"
        placeholder="请输入"
        :min="0"
        @change="validateFee"
      />
    </ElFormItem>

    <ElFormItem v-if="needToCharge" prop="fee">
      <div class="membership-charge">
        <span
          >当前余额: {{ globalStore.userProfile.balance?.toFixed(2) }}元</span
        >
        <span>会员费用: {{ membershipCharge.toFixed(2) }}元</span>
      </div>
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

<style lang="scss" scoped>
.el-form {
  max-width: 600px;
  margin: 0 auto;
}

.membership-days-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  @include mobile {
    .el-button + .el-button {
      margin-left: 6px;
    }
  }
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

<style lang="scss">
// .membership-dates-item {
//   .el-form-item__content {
//     @include mobile {
//       flex-direction: column;
//       row-gap: 10px;
//       .el-input {
//         margin-right: 0 !important;
//       }
//     }
//   }
// }
</style>
