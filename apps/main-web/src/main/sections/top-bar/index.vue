<script setup lang="ts">
import { useIsWeb } from '@tk-crawler/view-shared';
import LeftMenus from './left-menus.vue';
import RightPart from './right-part.vue';

defineOptions({
  name: 'TopBar',
});
const isWeb = useIsWeb();
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <img class="app-icon" src="/appicon.svg?url" alt="appicon" />
      <LeftMenus v-if="isWeb" />
    </div>
    <div class="top-bar-right">
      <RightPart />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--top-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
  @include web {
    padding: 0 3rem;
  }
  @include mobile {
    padding: 0 2rem;
  }
  .top-bar-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 2.5rem;
  }
  .app-icon {
    height: 3rem;
    width: auto;
  }
}
</style>
