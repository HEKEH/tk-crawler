<script setup lang="ts">
import { ElButton, ElInput, ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useGlobalStore } from '../../utils/vue';

defineOptions({
  name: 'Entry',
});

const MAX_INPUT_COUNT = 100;

const globalStore = useGlobalStore();
const content = ref('');

async function handleSubmit() {
  const userIds = content.value
    .trim()
    .split('\n')
    .map(id => id.trim())
    .filter(id => id);
  if (userIds.length > MAX_INPUT_COUNT) {
    ElMessage.error(`最多支持${MAX_INPUT_COUNT}个用户ID`);
    return;
  }
  if (userIds.length === 0) {
    ElMessage.error('请输入至少一个用户ID');
    return;
  }
  await globalStore.startExecute(userIds);
}
const isSubmitting = ref(false);

function clearContent() {
  content.value = '';
}
</script>

<template>
  <div class="entry">
    <ElInput
      v-model="content"
      class="anchors-input"
      type="textarea"
      :rows="30"
      resize="none"
      :placeholder="`请批量输入TikTok用户ID：
• 每行输入一个ID
• 最多支持${MAX_INPUT_COUNT}个ID

示例：
foo
bar
abc_xyz`"
    />
    <div class="button-group">
      <ElButton @click="clearContent">清空</ElButton>
      <ElButton
        type="primary"
        :loading="isSubmitting"
        :disabled="content.trim().length === 0"
        @click="handleSubmit"
      >
        下一步
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.entry {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 20px;
}
.anchors-input {
  max-width: 400px;
}
.button-group {
  display: flex;
  gap: 12px;
}
</style>
