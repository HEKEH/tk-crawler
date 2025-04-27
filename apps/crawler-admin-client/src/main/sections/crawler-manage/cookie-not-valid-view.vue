<script setup lang="ts">
import { ElButton, ElDialog, ElInput } from 'element-plus';
import { ref } from 'vue';
import { CRAWL_EVENTS } from '../../constants';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'CookieNotValidView',
});

const emit = defineEmits<{
  (e: 'loginTiktok'): void;
}>();

const cookiePasteDialogVisible = ref(false);

const crawlerManage = useGlobalStore().crawlerManage;

async function loginTiktok() {
  emit('loginTiktok');
}

function handleOpenPasteCookieDialog() {
  cookiePasteDialogVisible.value = true;
}

const cookie = ref('');

async function onSubmitCookie() {
  const currentCookie = cookie.value.trim();
  await window.ipcRenderer.invoke(CRAWL_EVENTS.SET_TK_COOKIE, currentCookie);
  await crawlerManage.checkTiktokCookieValid();
  cookiePasteDialogVisible.value = false;
}
</script>

<template>
  <div class="cookie-not-valid-view">
    <div>TK未登录或登录状态已失效，请重新登录TK账号以继续使用</div>
    <div>
      <ElButton type="primary" @click.prevent="loginTiktok">
        打开TK登录页
      </ElButton>
      <ElButton @click.prevent="handleOpenPasteCookieDialog">
        直接粘贴TK Cookie
      </ElButton>
    </div>
  </div>
  <ElDialog v-model="cookiePasteDialogVisible" title="粘贴TK Cookie">
    <ElInput
      v-model="cookie"
      type="textarea"
      placeholder="手动粘贴cookie"
      :rows="20"
      resize="none"
    />
    <ElButton
      class="submit-cookie-button"
      type="primary"
      :disabled="!cookie.trim()"
      @click="onSubmitCookie"
    >
      提交Cookie
    </ElButton>
  </ElDialog>
</template>

<style scoped>
.cookie-not-valid-view {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  row-gap: 20px;
}

.submit-cookie-button {
  margin-top: 10px;
}
</style>
