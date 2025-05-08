<script setup lang="ts">
import { getBodyHeight } from '@tk-crawler/electron-utils/render';
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

const bodyHeight = getBodyHeight();
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
  height: v-bind(bodyHeight);
  width: 100%;
  overflow: hidden;
}
</style>
