<script setup lang="ts">
import { computed } from 'vue';
import { Menu } from '../types';
import { useGlobalStore } from '../utils/vue';
import Entry from './entry/index.vue';
import TopBar from './top-bar/index.vue';

defineOptions({
  name: 'Homepage',
});
const globalStore = useGlobalStore();
const currentMenu = computed(() => {
  return globalStore.currentMenu;
});
</script>

<template>
  <div class="homepage">
    <TopBar />
    <div class="body">
      <Entry v-show="currentMenu === Menu.Entry" />
    </div>
  </div>
</template>

<style scoped>
.homepage {
  position: relative;
  overflow: hidden;
  margin-top: var(--top-bar-height);
  width: 100%;
  height: 100%;
}
.body {
  height: calc(100% - var(--top-bar-height) - 30px);
  width: 100%;
  overflow: hidden;
}
</style>
