<script setup lang="ts">
import { ElButton, ElInput } from 'element-plus';
import { ref } from 'vue';

defineOptions({
  name: 'MainView',
});

const cookie = ref<string>('');

function onSubmit() {}
</script>

<template>
  <div class="main-view-container">
    <div class="block">
      <div class="description">
        若登录遇到问题，可以手动粘贴cookie后点击提交
      </div>
      <ElInput
        v-model="cookie"
        type="textarea"
        placeholder="手动粘贴cookie"
        :rows="20"
        resize="none"
      />
      <ElButton type="primary" :disabled="!cookie.trim()" @click="onSubmit">
        提交
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.main-view-container {
  padding: 20px 10px;
  width: 100%;
  height: 100%;
  margin-right: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 30px;
  border-right: 1px dashed var(--el-color-primary);
}
.description {
  font-size: 14px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
</style>
