<script setup lang="ts">
import { ElButton } from 'element-plus';

defineOptions({
  name: 'NetworkErrorView',
});

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

async function retry() {
  emit('retry');
}
</script>

<template>
  <div class="network-error-view">
    <div class="tip-text">
      无法访问Tiktok，请检查是否开启VPN，且VPN是否开启了系统代理
    </div>
    <ElButton type="primary" @click.prevent="retry">重新检查网络</ElButton>
  </div>
</template>

<style scoped>
.network-error-view {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  row-gap: 20px;
}
.tip-text {
  color: var(--el-color-info);
  font-size: 20px;
  font-weight: 500;
}
</style>
