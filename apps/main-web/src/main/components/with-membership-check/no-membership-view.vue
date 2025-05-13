<script setup lang="ts">
import { ElLink, ElIcon } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';

defineOptions({
  name: 'NoMembershipView',
});

// function handleClick() {
//   // TODO: 跳转开通会员页面
// }
</script>

<template>
  <div class="no-membership-view">
    <ElIcon class="lock-icon"><Lock /></ElIcon>
    <span class="text">开通会员即可查看完整内容</span>
    <!-- <ElLink class="membership-link" type="primary" @click="handleClick">
      立即开通
    </ElLink> -->
  </div>
</template>

<style lang="scss" scoped>
.no-membership-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 24px;
  text-align: center;

  .lock-icon {
    font-size: 48px;
    color: var(--el-color-primary);
    margin-bottom: 8px;
  }

  .text {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.5;
  }

  .membership-link {
    font-size: 18px;
    font-weight: 500;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
  }
}
</style>
