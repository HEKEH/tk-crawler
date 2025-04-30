<script setup lang="ts">
import { useIsWebSize } from '@tk-crawler/view-shared';
import Menus from './menus.vue';
import RightPart from './right-part.vue';

defineOptions({
  name: 'TopBar',
});
const isWeb = useIsWebSize();
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <img class="app-icon" src="/appicon.svg?url" alt="appicon" />
      <Menus v-if="isWeb" />
    </div>
    <div class="top-bar-right">
      <RightPart />
      <Menus v-if="!isWeb" />
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
  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .app-icon {
    @include web {
      height: 3rem;
      width: auto;
    }
    @include mobile {
      height: 2rem;
      width: auto;
    }
  }
}
</style>
