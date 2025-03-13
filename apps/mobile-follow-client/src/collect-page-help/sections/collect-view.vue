<script setup lang="ts">
import type { IpcRendererEvent } from 'electron';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageQueue } from '@tk-crawler/view-shared';
import { COLLECT_PAGE_HELP_EVENTS } from '@tk-mobile-follow-client/shared';
import { markRaw, onBeforeUnmount } from 'vue';

defineOptions({
  name: 'CollectView',
});

const messageQueue = markRaw(
  new MessageQueue({
    messageOffset: 200,
  }),
);

function onAnchorListFetched(_: IpcRendererEvent, anchorList: any[]) {
  messageQueue.showMessage({
    message: `采集到 ${anchorList[0]?.account} 等 ${anchorList?.length} 条数据`,
    type: 'success',
  });
}

const electronRenderListeners = ElectronRenderListeners.getInstance();

electronRenderListeners.on(
  COLLECT_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
  onAnchorListFetched,
);
onBeforeUnmount(() => {
  electronRenderListeners.off(
    COLLECT_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
    onAnchorListFetched,
  );
});
</script>

<template>
  <div class="block">
    <div class="description">
      请在右侧页面中搜索主播，表格中的主播信息会被自动采集
    </div>
    <div
      v-loading="true"
      class="loading"
      element-loading-text="采集中..."
    ></div>
  </div>
</template>

<style scoped>
.description {
  font-size: 14px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
.loading {
  width: 100%;
  height: 20px;
  :global(.path) {
    r: 14px !important;
  }
}
</style>
