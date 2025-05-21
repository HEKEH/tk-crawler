<script setup lang="ts">
import type { AnchorCommentTemplateGroup } from '@tk-crawler/biz-shared';
import { ElTabPane, ElTabs } from 'element-plus';
import { reactive } from 'vue';
import AnchorCommentTemplateGroupTable from './anchor-comment-template-group-table/index.vue';
import AnchorCommentTemplateTable from './anchor-comment-template-table/index.vue';
import TabsManageModel from './tabs-manage-model';
import {
  generateTemplateTabId,
  TemplatesTabModel,
} from './tabs-manage-model/comment-templates-tab-model';
import { TabType } from './tabs-manage-model/types';

defineOptions({
  name: 'AnchorCommentTemplateManage',
});

const tabsManageModel = reactive(new TabsManageModel());

function handleTabChange(tab: string | number) {
  tabsManageModel.onSelectTab(tab as string);
}

function onCloseTab(tabId: string | number) {
  tabsManageModel.closeTab(tabId as string);
}

function onDeleteTemplateGroupItems(templateGroupIds: string[]) {
  const tabIds = templateGroupIds.map(id => generateTemplateTabId(id));
  tabsManageModel.batchCloseTabs(tabIds);
}

function onTemplateGroupManage(templateGroup: AnchorCommentTemplateGroup) {
  tabsManageModel.addOrSelectTab(new TemplatesTabModel({ templateGroup }));
}
</script>

<template>
  <div class="anchor-comment-template">
    <ElTabs
      :model-value="tabsManageModel.activeTabId"
      class="tabs"
      type="border-card"
      @tab-change="handleTabChange"
      @tab-remove="onCloseTab"
    >
      <ElTabPane
        v-for="tab in tabsManageModel.tabs"
        :key="tab.id"
        :label="tab.label"
        :name="tab.id"
        :closable="tab.closable"
      >
        <AnchorCommentTemplateGroupTable
          v-if="tab.type === TabType.TemplateGroupList"
          :selected="tab.id === tabsManageModel.activeTabId"
          @delete-items="onDeleteTemplateGroupItems"
          @template-group-manage="onTemplateGroupManage"
        />
        <AnchorCommentTemplateTable
          v-else-if="tab.type === TabType.Templates"
          :template-group-id="(tab as TemplatesTabModel).templateGroup.id"
        />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style scoped>
.anchor-comment-template {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  .tabs {
    width: 100%;
    border-top: unset;
  }
  :global(.el-tabs--border-card) {
    border: unset;
    :global(.el-tab-pane) {
      height: 100%;
      overflow: hidden;
    }
  }
  :global(.el-tab-pane) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}
</style>
