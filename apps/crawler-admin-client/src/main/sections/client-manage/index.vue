<script setup lang="ts">
import type OrgManageTabModel from '../../domain/client-manage/org-manage-tab-model';
import { ElTabPane, ElTabs } from 'element-plus';
import { ClientTabType } from '../../domain/client-manage/types';
import { useGlobalStore } from '../../utils/vue';
import OrgManage from './org-manage/index.vue';

defineOptions({
  name: 'ClientManage',
});
const globalStore = useGlobalStore();
const { clientManage } = globalStore;

function handleTabChange(tab: string | number) {
  clientManage.onSelectTab(tab as string);
}

function onCloseTab(tabId: string | number) {
  clientManage.closeTab(tabId as string);
}
</script>

<template>
  <div class="org-and-user-manage">
    <ElTabs
      :model-value="clientManage.activeTabId"
      class="org-user-tabs"
      type="border-card"
      @tab-change="handleTabChange"
      @tab-remove="onCloseTab"
    >
      <ElTabPane
        v-for="tab in clientManage.tabs"
        :key="tab.id"
        :label="tab.label"
        :name="tab.id"
        :closable="tab.closable"
      >
        <OrgManage
          v-if="tab.type === ClientTabType.OrgManage"
          :model="tab as OrgManageTabModel"
        />
        <template v-else>
          {{ tab.label }}
        </template>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style scoped>
.org-and-user-manage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  .org-user-tabs {
    width: 100%;
    border-top: unset;
  }
}
</style>
