<script setup lang="ts">
import {
  AnchorRankLeague,
  type OrgAnchorSearchPolicies,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';
import { updateOrgAnchorSearchPolicies } from '../../../requests';
import { useGlobalStore } from '../../../utils';

export type AnchorSearchPoliciesFormValues = Omit<
  OrgAnchorSearchPolicies,
  'rank_league_limit'
> & {
  rank_league_limit: AnchorRankLeague | undefined;
  highest_diamonds_limit: number | undefined;
};

const formRef = ref<FormInstance>();

const globalStore = useGlobalStore();

const form = reactive<Partial<AnchorSearchPoliciesFormValues>>({
  ignore_commerce_anchor:
    globalStore.userProfile.orgInfo!.ignore_commerce_anchor,
  highest_diamonds_limit:
    globalStore.userProfile.orgInfo!.highest_diamonds_limit ?? undefined,
  rank_league_limit:
    globalStore.userProfile.orgInfo!.rank_league_limit ?? undefined,
});

const rules: FormRules = {
  ignore_commerce_anchor: [{ required: true, message: '不能为空' }],
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
        const newPolicies: OrgAnchorSearchPolicies = {
          ignore_commerce_anchor: form.ignore_commerce_anchor!,
          highest_diamonds_limit: form.highest_diamonds_limit ?? null,
          rank_league_limit: form.rank_league_limit ?? null,
        };
        const res = await updateOrgAnchorSearchPolicies(
          newPolicies,
          globalStore.token,
        );
        if (res.status_code === RESPONSE_CODE.SUCCESS) {
          ElMessage.success('保存成功');
          globalStore.userProfile.setSearchAnchorPolicies(newPolicies);
        }
      } finally {
        isLoading.value = false;
      }
    } else {
      console.error('表单验证失败:', fields);
    }
  });
}

const isWebSize = useIsWebSize();

const rankLeagueOptions = Object.values(AnchorRankLeague).map(league => ({
  label: league,
  value: league,
}));
</script>

<template>
  <div class="flex flex-col gap-2 p-4 w-full items-center">
    <ElForm
      ref="formRef"
      :size="isWebSize ? 'default' : 'small'"
      :model="form"
      :rules="rules"
      :label-width="isWebSize ? '150px' : '130px'"
      label-position="right"
    >
      <ElFormItem label="是否忽略带货主播" prop="ignore_commerce_anchor">
        <ElRadioGroup v-model="form.ignore_commerce_anchor">
          <ElRadio :value="true">是</ElRadio>
          <ElRadio :value="false">否</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="最高钻石数不小于" prop="highest_diamonds_limit">
        <ElInputNumber
          v-model="form.highest_diamonds_limit"
          :precision="0"
          :step="50"
          :min="0"
          placeholder="请输入"
        />
      </ElFormItem>
      <ElFormItem label="直播段位不低于" prop="rank_league_limit">
        <ElSelect v-model="form.rank_league_limit" clearable>
          <ElOption
            v-for="option in rankLeagueOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" :loading="isLoading" @click="handleSubmit">
          保存
        </ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped>
.el-form {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  .form-item-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
