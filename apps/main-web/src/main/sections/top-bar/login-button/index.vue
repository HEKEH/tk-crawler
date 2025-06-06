<script setup lang="ts">
import { ElButton } from 'element-plus';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import LoginDialog from './login-dialog.vue';

const route = useRoute();
const dialogVisible = ref(false);

// Use computed to reactively access query parameters
const shouldShowLogin = computed(() => route.query.login === 'true');

// Watch for changes in the query parameter
watch(
  shouldShowLogin,
  newValue => {
    dialogVisible.value = newValue;
  },
  { immediate: true },
);

function handleClick() {
  dialogVisible.value = true;
}

function handleClose() {
  dialogVisible.value = false;
}

// 处理登录成功
function handleLoginSuccess() {
  dialogVisible.value = false;
}

// 处理登录失败
function handleLoginError() {
  // 登录失败时保持弹窗打开
}
</script>

<template>
  <ElButton type="text" @click="handleClick"> 登录 </ElButton>

  <LoginDialog
    :visible="dialogVisible"
    @close="handleClose"
    @success="handleLoginSuccess"
    @error="handleLoginError"
  />
</template>
