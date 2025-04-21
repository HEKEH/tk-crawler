<script setup lang="ts">
import LeftMenus from './left-menus.vue';
import RightPart from './right-part.vue';

defineOptions({
  name: 'TopBar',
});
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <img class="app-icon" src="/appicon.svg?url" alt="appicon" />
      <LeftMenus />
    </div>
    <div class="top-bar-right">
      <RightPart />
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  position: fixed;
  padding: 0 4rem;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--top-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
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
