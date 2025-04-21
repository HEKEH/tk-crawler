<script setup lang="ts">
import type {
  AnchorFollowGroupItem,
  AnchorFrom87RawData,
} from '@tk-crawler/biz-shared';
import type { IpcRendererEvent } from 'electron';
import { ArrowRight, DataAnalysis } from '@element-plus/icons-vue';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageQueue } from '@tk-crawler/view-shared';
import { COLLECT_PAGE_HELP_EVENTS } from '@tk-mobile-follow-client/shared';
import { ElIcon } from 'element-plus';
import { markRaw, onBeforeUnmount, ref } from 'vue';

defineOptions({
  name: 'CollectView',
});

const groupName = ref<string>();
async function updateGroup() {
  const group: AnchorFollowGroupItem | null = await window.ipcRenderer.invoke(
    COLLECT_PAGE_HELP_EVENTS.GET_GROUP,
  );
  groupName.value = group?.name;
}
updateGroup();

const messageQueue = markRaw(
  new MessageQueue({
    messageOffset: 300,
  }),
);

function onAnchorListFetched(
  _: IpcRendererEvent,
  data: { anchorList: AnchorFrom87RawData[]; createCount: number },
) {
  messageQueue.showMessage({
    message: `采集到 ${data.anchorList[0]?.account} 等 ${data.anchorList?.length} 条数据，${
      groupName.value
        ? `其中 ${data.createCount} 条新数据已加入分组「${groupName.value}」`
        : `其中 ${data.createCount} 条为新数据`
    }`,
    type: 'success',
  });
}

const electronRenderListeners = ElectronRenderListeners.getInstance();

electronRenderListeners.on(
  COLLECT_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
  onAnchorListFetched,
);
onBeforeUnmount(() => {
  messageQueue.clearMessages();
  electronRenderListeners.off(
    COLLECT_PAGE_HELP_EVENTS.ANCHOR_LIST_FETCHED,
    onAnchorListFetched,
  );
});
</script>

<template>
  <div class="block">
    <div class="description">
      <div>
        <b>自动采集说明：</b>系统将自动采集右侧表格中显示的所有主播信息。
      </div>
      <div>
        <b>提高效率建议：</b
        >将右侧表格"每页显示条数"设置为200，可大幅提升数据采集速度。
      </div>
    </div>
    <div v-if="groupName" class="tip">
      <ElIcon><DataAnalysis /></ElIcon>
      正在为分组
      <span class="group-name">「{{ groupName }}」</span>
      采集主播数据
    </div>
    <div class="tip" style="color: var(--el-color-primary)">
      <ElIcon><ArrowRight /></ElIcon>
      请在右侧页面浏览您需要采集的主播数据
    </div>
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
  :global(.el-icon) {
    vertical-align: middle;
  }
}
.group-name {
  font-weight: bold;
  color: var(--el-color-primary);
}
</style>
