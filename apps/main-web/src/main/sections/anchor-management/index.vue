<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AnchorTable from './anchor-table';

defineOptions({
  name: 'AnchorManagement',
});

enum MenuType {
  ANCHOR_TABLE = 'anchor-table',
}
const route = useRoute();
const router = useRouter();
const MenuList = [
  {
    type: MenuType.ANCHOR_TABLE,
    label: '主播列表',
  },
];
const currentMenu = computed(() => {
  return (route.params.subMenu || MenuList[0].type) as MenuType;
});

function handleSelectMenu(key: string) {
  router.push({
    path: `/anchor-management/${key as MenuType}`,
  });
}
</script>

<template>
  <div class="container">
    <div class="left-part">
      <ElMenu
        :default-active="currentMenu"
        class="side-menus"
        @select="handleSelectMenu"
      >
        <ElMenuItem
          v-for="menu in MenuList"
          :key="menu.type"
          :index="menu.type"
        >
          <span>{{ menu.label }}</span>
        </ElMenuItem>
      </ElMenu>
    </div>
    <div class="right-part">
      <KeepAlive>
        <AnchorTable v-if="currentMenu === MenuType.ANCHOR_TABLE" />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  .left-part {
    width: fit-content;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);
  }
  .right-part {
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .side-menus {
    width: 100%;
    border-right: unset;
  }
}
</style>
