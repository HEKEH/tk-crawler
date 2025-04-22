<script setup lang="ts">
import { CrawlStatus } from '@tk-crawler/biz-shared';
import { computed } from 'vue';
import { useGlobalStore } from '../../utils';
import ControlButtons from './control-buttons.vue';

defineOptions({
  name: 'CrawlerManageNormalView',
});

const globalStore = useGlobalStore();

const crawlerManage = computed(() => globalStore.crawlerManage);

async function start() {
  await crawlerManage.value.start();
}
async function stop() {
  await crawlerManage.value.stop();
}
</script>

<template>
  <div class="normal-view">
    <div class="normal-view-description">TK 账号状态正常，可以继续采集数据</div>
    <ControlButtons
      :is-crawling="crawlerManage.crawlStatus !== CrawlStatus.STOPPED"
      @start="start"
      @stop="stop"
    />
    <div
      v-if="crawlerManage.crawlStatus === CrawlStatus.SUSPENDED"
      class="suspended-status"
    >
      由于连续出现请求错误，疑似触发了TK的反爬虫机制，或发生了网络问题，暂停采集，数分钟后将自动恢复
    </div>
  </div>
</template>

<style scoped>
.normal-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  .normal-view-description {
    margin-bottom: 1rem;
    font-size: 1rem;
    color: var(--el-text-color-regular);
  }
  .suspended-status {
    margin-top: 3rem;
    font-size: 1rem;
    color: var(--el-color-danger);
  }
}
</style>
