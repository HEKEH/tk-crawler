<script setup lang="ts">
import { MenuSelect } from '@tk-crawler/view-shared';
import { ref } from 'vue';
import { SidebarWidth } from './constants';
import DataCollect from './data-collect/index.vue';
import DataStatistics from './data-statistics';

defineOptions({
  name: 'CrawlerManage',
});

enum MenuType {
  DATA_COLLECT = 'data-collect',
  DATA_STATISTICS = 'data-statistics',
}

const MenuList = [
  {
    value: MenuType.DATA_COLLECT,
    label: '数据采集',
  },
  {
    value: MenuType.DATA_STATISTICS,
    label: '数据统计',
  },
];
const currentMenu = ref(MenuList[0]?.value);

function handleSelectMenu(key: string) {
  currentMenu.value = key as MenuType;
}
</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col md:flex-row">
    <div
      class="overflow-hidden w-full h-fit pt-2 px-4 md:h-full md:w-fit md:border-r md:border-[var(--el-border-color)] md:p-0 menu-container"
    >
      <MenuSelect
        :menus="MenuList"
        :value="currentMenu"
        @select="handleSelectMenu"
      />
    </div>
    <div class="h-full flex-1 p-4 md:p-8">
      <KeepAlive>
        <DataCollect v-if="currentMenu === MenuType.DATA_COLLECT" />
      </KeepAlive>
      <DataStatistics v-if="currentMenu === MenuType.DATA_STATISTICS" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-container {
  @include web {
    width: v-bind('`${SidebarWidth}px`');
  }
}
</style>
