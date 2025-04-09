<script setup lang="ts">
import type { TKGuildUser } from '@tk-crawler/biz-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
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

const DEFAULT_MAX_QUERY_PER_HOUR = 50;
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
  ],
  password: [{ required: true, message: '请输入后台查询密码' }],
  // area: [{ required: true, message: '请选择分区' }],
  max_query_per_hour: [{ required: true, message: '请输入每小时查询次数' }],
  max_query_per_day: [{ required: true, message: '请输入每天查询次数' }],
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

// const globalStore = useGlobalStore();

// const areaOptions = computed(() => {
//   const areasSet = new Set(globalStore.userProfile.orgInfo?.areas);
//   return AREA_OPTIONS.filter(item => areasSet.has(item.value));
// });
</script>

<template>
  <ElForm
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="140px"
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
    <ElFormItem label="每小时查询次数" prop="max_query_per_hour">
      <ElInputNumber
        :model-value="form.max_query_per_hour ?? undefined"
        :min="1"
        :max="MAX_QUERY_PER_HOUR"
        placeholder="请输入每小时查询次数"
        @update:model-value="form.max_query_per_hour = $event"
      />
    </ElFormItem>
    <ElFormItem label="每天查询次数" prop="max_query_per_day">
      <ElInputNumber
        :model-value="form.max_query_per_day ?? undefined"
        :min="1"
        :max="MAX_QUERY_PER_DAY"
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
}
</style>
