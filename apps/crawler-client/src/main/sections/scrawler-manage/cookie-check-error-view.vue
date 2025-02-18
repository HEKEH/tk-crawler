<script setup lang="ts">
import { IsCookieValidResultStatus } from '@tk-crawler-client/shared';
import { ElButton } from 'element-plus';
import { computed } from 'vue';

defineOptions({
  name: 'CookieCheckErrorView',
});

const props = defineProps<{
  cookieValidStatus: IsCookieValidResultStatus;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

async function retry() {
  emit('retry');
}

const text = computed(() => {
  if (props.cookieValidStatus === IsCookieValidResultStatus.ECONNRESET) {
    return '连接Tiktok失败，请检查网络，例如是否开启VPN，且VPN是否开启了全局代理';
  }
  if (props.cookieValidStatus === IsCookieValidResultStatus.TIMEOUT) {
    return '连接Tiktok超时，请检查网络，例如是否开启VPN，且VPN是否开启了全局代理';
  }
  return '请求Tiktok接口失败，请检查网络';
});
</script>

<template>
  <div class="cookie-check-error-view">
    <div class="tip-text">{{ text }}</div>
    <ElButton type="primary" @click.prevent="retry">重试</ElButton>
  </div>
</template>

<style scoped>
.cookie-check-error-view {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  row-gap: 20px;
}
.tip-text {
  color: var(--el-color-primary);
  font-size: 20px;
  font-weight: 500;
}
</style>
