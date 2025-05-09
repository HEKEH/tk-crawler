<script setup lang="ts">
import type { TKGuildUser } from '@tk-crawler/biz-shared';
import { InfoFilled } from '@element-plus/icons-vue';
import { useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElTooltip,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

export type GuildUserFormValues = Pick<
  TKGuildUser,
  'username' | 'password' | 'max_query_per_hour' | 'max_query_per_day'
>;

const props = defineProps<{
  initialData?: Partial<GuildUserFormValues>;
  submit: (data: GuildUserFormValues) => void;
}>();
const emit = defineEmits<{
  cancel: [];
}>();
const MAX_QUERY_PER_HOUR = 60;
const MAX_QUERY_PER_DAY = 300;

const DEFAULT_MAX_QUERY_PER_HOUR = 20;
const DEFAULT_MAX_QUERY_PER_DAY = 280;

const formRef = ref<FormInstance>();

const form = reactive<Partial<GuildUserFormValues>>({
  username: props.initialData?.username || '',
  password: props.initialData?.password || '',
  // area: props.initialData?.area,
  max_query_per_hour:
    props.initialData?.max_query_per_hour || DEFAULT_MAX_QUERY_PER_HOUR,
  max_query_per_day:
    props.initialData?.max_query_per_day || DEFAULT_MAX_QUERY_PER_DAY,
});

const rules: FormRules = {
  username: [
    { required: true, message: '请输入后台查询账号' },
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
  password: [
    { required: true, message: '请输入后台查询密码' },
    {
      validator: (rule, value, callback) => {
        if (value && value.includes(' ')) {
          callback(new Error('密码不要有空格'));
        }
        callback();
      },
    },
  ],
  max_query_per_hour: [
    { required: true, message: '请输入每小时查询次数' },
    { type: 'number', message: '请输入数字' },
  ],
  max_query_per_day: [
    { required: true, message: '请输入每天查询次数' },
    { type: 'number', message: '请输入数字' },
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
          username: form.username!,
          password: form.password!,
          // area: form.area!,
          max_query_per_hour: form.max_query_per_hour!,
          max_query_per_day: form.max_query_per_day!,
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
const isWebSize = useIsWebSize();
// const globalStore = useGlobalStore();

// const areaOptions = computed(() => {
//   const areasSet = new Set(globalStore.userProfile.orgInfo?.areas);
//   return AREA_OPTIONS.filter(item => areasSet.has(item.value));
// });
</script>

<template>
  <ElForm
    ref="formRef"
    :size="isWebSize ? 'default' : 'small'"
    :model="form"
    :rules="rules"
    :label-width="isWebSize ? '150px' : '130px'"
    label-position="right"
  >
    <ElFormItem label="后台查询账号" prop="username">
      <ElInput v-model="form.username" placeholder="请输入后台查询账号" />
    </ElFormItem>
    <ElFormItem label="后台查询密码" prop="password">
      <ElInput v-model="form.password" placeholder="请输入后台查询密码" />
    </ElFormItem>
    <!-- <ElFormItem label="分区" prop="area">
      <AreaSelectSingle
        v-model="form.area"
        :options="areaOptions"
        :show-all="false"
      />
    </ElFormItem> -->
    <ElFormItem prop="max_query_per_hour">
      <template #label>
        <div class="form-item-label">
          每小时查询次数
          <ElTooltip
            placement="top"
            :content="`每次验证 30 位主播的可邀约状态${form.max_query_per_hour ? `，每小时 ${form.max_query_per_hour} 次最多可验证 ${form.max_query_per_hour * 30} 位主播` : ''}`"
          >
            <ElIcon>
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </div>
      </template>
      <ElInputNumber
        style="width: 100%"
        :model-value="form.max_query_per_hour ?? undefined"
        :min="1"
        :max="MAX_QUERY_PER_HOUR"
        :precision="0"
        placeholder="请输入每小时查询次数"
        @update:model-value="form.max_query_per_hour = $event"
      />
    </ElFormItem>
    <ElFormItem label="每天查询次数" prop="max_query_per_day">
      <template #label>
        <div class="form-item-label">
          每天查询次数
          <ElTooltip
            placement="top"
            :content="`每次验证 30 位主播的可邀约状态${form.max_query_per_day ? `，每天 ${form.max_query_per_day} 次最多可验证 ${form.max_query_per_day * 30} 位主播` : ''}`"
          >
            <ElIcon>
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </div>
      </template>
      <ElInputNumber
        style="width: 100%"
        :model-value="form.max_query_per_day ?? undefined"
        :min="1"
        :max="MAX_QUERY_PER_DAY"
        :precision="0"
        placeholder="请输入每天查询次数"
        @update:model-value="form.max_query_per_day = $event"
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
  .form-item-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
