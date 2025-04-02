<script setup lang="ts">
import type { AnchorFrom87RawData } from '@tk-crawler/biz-shared';
import type { IpcRendererEvent } from 'electron';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { GUILD_COOKIE_PAGE_HELP_EVENTS } from '@tk-crawler/main-client-shared';
import { MessageQueue } from '@tk-crawler/view-shared';
import { markRaw, onBeforeUnmount } from 'vue';

defineOptions({
  name: 'CollectView',
});

const messageQueue = markRaw(
  new MessageQueue({
    messageOffset: 200,
  }),
);

function onAnchorListFetched(
  _: IpcRendererEvent,
  data: { anchorList: AnchorFrom87RawData[]; createCount: number },
) {
  messageQueue.showMessage({
    message: `采集到 ${data.anchorList[0]?.account} 等 ${data.anchorList?.length} 条数据，其中 ${data.createCount} 条为新数据`,
    type: 'success',
  });
}

const electronRenderListeners = ElectronRenderListeners.getInstance();

electronRenderListeners.on(
  GUILD_COOKIE_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
  onAnchorListFetched,
);
onBeforeUnmount(() => {
  electronRenderListeners.off(
    GUILD_COOKIE_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
    onAnchorListFetched,
  );
});
</script>

<template>
  <div class="block">
    <div class="description">
      右侧页面表格中的主播信息会被自动采集。
      <br />
      为了加快采集速度，建议每页条数改为200。
    </div>
    <!-- <div
      v-loading="true"
      class="loading"
      element-loading-text="自动采集中，请在右侧页面进行数据搜索"
    ></div> -->
    <div class="tip">正在自动采集中...<br />请在右侧页面获取您想要的数据 →</div>
  </div>
</template>

<style scoped>
.description {
  font-size: 15px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
.tip {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: var(--el-color-primary);
}
/* .loading {
  width: 100%;
  height: 20px;
  :global(.path) {
    r: 14px !important;
  }
} */
</style>
