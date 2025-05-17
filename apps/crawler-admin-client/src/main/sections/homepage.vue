<script setup lang="ts">
import { getBodyHeight } from '@tk-crawler/electron-utils/render';
import { computed } from 'vue';
import { Page } from '../types';
import { useGlobalStore } from '../utils';
import { ClientManage } from './client-manage';
import { CrawlerManage } from './crawler-manage';
import { GuildManagement } from './guild-management';
import Login from './login/index.vue';
import { SystemManage } from './system-management';
import TopBar from './top-bar/index.vue';

defineOptions({
  name: 'Homepage',
});

const globalStore = useGlobalStore();

const bodyHeight = getBodyHeight();

const currentPage = computed(() => {
  return globalStore.currentPage;
});
</script>

<template>
  <div class="homepage">
    <TopBar />
    <div class="body">
      <Login v-if="currentPage === Page.Login" />
      <KeepAlive>
        <CrawlerManage v-if="currentPage === Page.Crawler" />
      </KeepAlive>
      <KeepAlive>
        <SystemManage v-if="currentPage === Page.System" />
      </KeepAlive>
      <KeepAlive>
        <ClientManage v-if="currentPage === Page.Client" />
      </KeepAlive>
      <KeepAlive>
        <GuildManagement v-if="currentPage === Page.GuildManage" />
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
  height: v-bind(bodyHeight);
  width: 100%;
  overflow: hidden;
}
</style>
