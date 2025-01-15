<script setup lang="ts">
import type { LiveAnchorCrawlerSettings, Region } from '@tk-crawler/shared';
import type { FormRules } from 'element-plus';
import { ElButton, ElForm, ElFormItem } from 'element-plus';
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
  region: [
    {
      required: true,
      trigger: ['change', 'blur', 'input'],
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
  ],
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
</style>
