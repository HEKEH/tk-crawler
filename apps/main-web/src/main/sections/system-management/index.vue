<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { ref } from 'vue';
import OrgMembersManage from './org-members-manage/index.vue';

defineOptions({
  name: 'SystemManagement',
});

enum MenuType {
  USER = 'user',
}

const currentMenu = ref<MenuType>(MenuType.USER);

function handleSelectMenu(key: string) {
  currentMenu.value = key as MenuType;
}

const MenuList = [
  {
    type: MenuType.USER,
    label: '用户管理',
  },
];
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
        <OrgMembersManage v-if="currentMenu === MenuType.USER" />
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
