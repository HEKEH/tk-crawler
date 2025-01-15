<script setup lang="ts">
import type { LiveAnchorCrawlerSettings } from '@tk-crawler/shared';
import { computed } from 'vue';
import { useGlobalStore } from '../../utils/vue';
import ScrawlerSettingForm from './setting-form.vue';

defineOptions({
  name: 'ScrawlerManage',
});

const globalStore = useGlobalStore();

const liveAnchorCrawlerSettings = computed(() => {
  return globalStore.liveAnchorCrawlerSettings!;
});

async function handleUpdateSetting(setting: LiveAnchorCrawlerSettings) {
  await globalStore.submitLiveAnchorCrawlerSetting(setting);
}
</script>

<template>
  <div class="scrawler-manage">
    <ScrawlerSettingForm
      :setting="liveAnchorCrawlerSettings"
      @update:setting="handleUpdateSetting"
    />
  </div>
</template>

<style scoped>
.scrawler-manage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
