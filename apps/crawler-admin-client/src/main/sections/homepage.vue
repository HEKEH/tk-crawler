<script setup lang="ts">
import { getBodyHeight } from '@tk-crawler/electron-utils/render';
import TopBar from './top-bar/index.vue';

defineOptions({
  name: 'Homepage',
});
const bodyHeight = getBodyHeight();
</script>

<template>
  <div class="homepage">
    <TopBar />
    <div class="body">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
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
