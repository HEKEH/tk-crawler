<script setup lang="ts">
import { computed } from 'vue';
import { Page } from '../types';
import { useGlobalStore } from '../utils';
import ClientManage from './client-manage/index.vue';
import CrawlerManage from './crawler-manage/index.vue';
import Login from './login/index.vue';
import TopBar from './top-bar/index.vue';

defineOptions({
  name: 'Homepage',
});
const globalStore = useGlobalStore();

const currentPage = computed(() => {
  return globalStore.currentPage;
});
</script>

<template>
  <div class="homepage">
    <TopBar />
    <div class="body">
      <Login v-if="currentPage === Page.Login" />
      <CrawlerManage v-else-if="currentPage === Page.Crawler" />
      <KeepAlive>
        <ClientManage v-if="currentPage === Page.Client" />
      </KeepAlive>
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
