<script setup lang="ts">
import type { LiveAnchorCrawlerSettings, Region } from '@tk-crawler/shared';
import type { FormRules } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInputNumber,
  ElTooltip,
} from 'element-plus';
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';
import RegionSelect from '../../components/region-select.vue';

defineOptions({
  name: 'ScrawlerSettingForm',
});

const props = defineProps<{
  setting: LiveAnchorCrawlerSettings;
}>();

const emit = defineEmits<{
  (e: 'update:setting', value: LiveAnchorCrawlerSettings): void;
}>();
const form = ref(cloneDeep(props.setting));
watch(props.setting, newVal => {
  form.value = cloneDeep(newVal);
});

const formRef = ref<InstanceType<typeof ElForm>>();
const rules: FormRules<LiveAnchorCrawlerSettings> = {
  region: {
    required: true,
    trigger: 'change',
    validator: (rule, value: Region[] | 'all', callback) => {
      if (value === undefined || value === null) {
        callback(new Error('地区不能为空'));
        return;
      }

      if (value === 'all') {
        callback(); // 验证通过
        return;
      }

      if (Array.isArray(value) && value.length === 0) {
        callback(new Error('地区不能为空'));
        return;
      }

      callback(); // 验证通过
    },
  },
  fansLimit: {
    trigger: 'blur',
    validator: (
      rule,
      value: [number | undefined, number | undefined],
      callback,
    ) => {
      if (value && value[0] && value[1] && value[0] > value[1]) {
        callback(new Error('粉丝数量下限不能大于上限'));
        return;
      }
      callback();
    },
  },
};

async function handleSave() {
  if (!formRef.value) {
    return;
  }

  try {
    await formRef.value.validate();
    emit('update:setting', form.value);
  } catch (error) {
    console.error('表单校验失败:', error);
  }
}

function handleUpdateFansLimitLow(value: number | undefined) {
  form.value.fansLimit = [value, form.value.fansLimit?.[1]];
}

function handleUpdateFansLimitHigh(value: number | undefined) {
  form.value.fansLimit = [form.value.fansLimit?.[0], value];
}

const InputNumberWidth = '160px';
</script>

<template>
  <div class="crawler-setting-form">
    <ElForm
      ref="formRef"
      :rules="rules"
      :model="form"
      label-width="auto"
      @submit.prevent="handleSave"
    >
      <ElFormItem label="地区" prop="region">
        <RegionSelect v-model="form.region" clearable />
      </ElFormItem>
      <ElFormItem label="1小时最大查询次数" prop="queryLimitOneHour">
        <template #label>
          <span class="label">
            1小时最大查询次数
            <ElTooltip
              content="TikTok官方直播后台对单个账号有限制，1小时最多查询60次"
            >
              <ElIcon><Warning /></ElIcon>
            </ElTooltip>
          </span>
        </template>
        <ElInputNumber
          v-model="form.queryLimitOneHour"
          :style="{ width: InputNumberWidth }"
          :max="60"
          :min="1"
        />
      </ElFormItem>
      <ElFormItem prop="queryLimitOneDay">
        <template #label>
          <span class="label">
            24小时最大查询次数
            <ElTooltip
              content="TikTok官方直播后台对单个账号有限制，24小时最多查询300次"
            >
              <ElIcon><Warning /></ElIcon>
            </ElTooltip>
          </span>
        </template>
        <ElInputNumber
          v-model="form.queryLimitOneDay"
          :style="{ width: InputNumberWidth }"
          :max="300"
          :min="1"
        />
      </ElFormItem>
      <ElFormItem label="粉丝数量限制" prop="fansLimit">
        <ElInputNumber
          :model-value="form.fansLimit?.[0]"
          :style="{ width: InputNumberWidth }"
          :min="0"
          clearable
          @update:model-value="handleUpdateFansLimitLow"
        />
        <span class="fans-limit-separator" />
        <ElInputNumber
          :model-value="form.fansLimit?.[1]"
          :style="{ width: InputNumberWidth }"
          :min="0"
          clearable
          @update:model-value="handleUpdateFansLimitHigh"
        />
      </ElFormItem>
      <ElFormItem>
        <ElButton style="margin-top: 1rem" type="primary" @click="handleSave">
          开始爬取数据
        </ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped>
.crawler-setting-form {
  position: relative;
  width: 100%;
  max-width: 600px;
}
.label {
  display: flex;
  align-items: center;
  column-gap: 0.25rem;
  .el-icon {
    cursor: pointer;
  }
}
.fans-limit-separator {
  display: inline-block;
  width: 1rem;
  border-top: 1px solid var(--el-text-color-secondary);
  vertical-align: middle;
  margin: 0 0.5rem;
}
</style>
