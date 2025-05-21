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
  <div
    class="fixed top-0 left-0 w-full h-[var(--top-bar-height)] flex items-center justify-between border-b border-[var(--el-border-color)] pl-8 pr-8 md:pl-12 md:pr-12"
  >
    <div class="flex-1 flex items-center gap-x-10">
      <img class="h-8 w-auto md:h-12" src="/appicon.svg?url" alt="appicon" />
      <Menus v-if="isWeb" />
    </div>
    <div class="flex items-center gap-x-4">
      <RightPart />
      <Menus v-if="!isWeb" />
    </div>
  </div>
</template>
