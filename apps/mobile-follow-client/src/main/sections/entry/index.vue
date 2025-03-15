<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { ref } from 'vue';
import AnchorSection from './anchor-section/index.vue';

defineOptions({
  name: 'Entry',
});

enum MenuType {
  ANCHOR = 'anchor',
  GROUP = 'group',
}

const currentMenu = ref<MenuType>(MenuType.ANCHOR);

function handleSelectMenu(key: string) {
  currentMenu.value = key as MenuType;
}

const MenuList = [
  {
    type: MenuType.ANCHOR,
    label: '主播列表',
  },
  {
    type: MenuType.GROUP,
    label: '分组管理',
  },
];
</script>

<template>
  <div class="entry">
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
        <AnchorSection v-if="currentMenu === MenuType.ANCHOR" />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.entry {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  .left-part {
    width: 140px;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);
  }
  .right-part {
    flex: 1;
    height: 100%;
    overflow: hidden;
    padding: 1rem 0.5rem 0.5rem 1rem;
  }
  .side-menus {
    width: 100%;
    border-right: unset;
  }
}
</style>
