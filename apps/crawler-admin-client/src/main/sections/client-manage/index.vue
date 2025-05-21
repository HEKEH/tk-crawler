<script setup lang="ts">
import type OrgMembersManageTabModel from '../../domain/client-manage/members-manage-tab-model';
import type MobileDevicesManageTabModel from '../../domain/client-manage/mobile-devices-tab-model';
import type OrgManageTabModel from '../../domain/client-manage/org-manage-tab-model';
import { ElTabPane, ElTabs } from 'element-plus';
import { ClientTabType } from '../../domain/client-manage/types';
import { useGlobalStore } from '../../utils';
import MobileDevicesManage from './mobile-devices-manage/index.vue';
import OrgManage from './org-manage/index.vue';
import OrgMembersManage from './org-members-manage/index.vue';

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
        <OrgMembersManage
          v-else-if="tab.type === ClientTabType.OrgMembersManage"
          :model="tab as OrgMembersManageTabModel"
        />
        <MobileDevicesManage
          v-else-if="tab.type === ClientTabType.MobileDevicesManage"
          :model="tab as MobileDevicesManageTabModel"
        />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style lang="scss">
.org-and-user-manage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  .org-user-tabs {
    width: 100%;
    border-top: unset;
  }
  .el-tabs__item {
    @include mobile {
      height: 36px;
      font-size: 13px;
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }
  .el-tab-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .el-tabs__content {
    @include web {
      padding: 1.5rem;
    }
  }
}
</style>
