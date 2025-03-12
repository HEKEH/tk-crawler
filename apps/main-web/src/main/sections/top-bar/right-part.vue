<script setup lang="ts">
import { ElLink } from 'element-plus';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'RightPart',
});

const globalStore = useGlobalStore();
</script>

<template>
  <div class="right-part">
    <!-- <ElLink
      class="right-part-item"
      :underline="false"
      @click="globalStore.switchTikTokAccount()"
    >
      切换TikTok账号
    </ElLink> -->
  </div>
</template>

<style scoped>
.right-part {
  height: 100%;
  display: flex;
  align-items: center;
  column-gap: 3rem;

  .right-part-item {
    font-size: 1rem;
    &.active {
      color: var(--el-color-primary);
    }
  }
}
</style>
