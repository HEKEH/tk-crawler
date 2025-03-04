<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { OrgAndUserMenu } from '../../types';

defineOptions({
  name: 'OrgAndUserManageSideMenus',
});

const props = defineProps<{
  currentMenu: OrgAndUserMenu;
}>();

const emit = defineEmits<{
  (e: 'update:currentMenu', value: OrgAndUserMenu): void;
}>();

function handleSelect(menu: string) {
  emit('update:currentMenu', menu as OrgAndUserMenu);
}

const menus = [
  {
    label: '机构管理',
    index: OrgAndUserMenu.Org,
  },
  {
    label: '用户管理',
    index: OrgAndUserMenu.User,
  },
];
</script>

<template>
  <div class="side-menus-container">
    <ElMenu
      :default-active="props.currentMenu"
      class="side-menus"
      @select="handleSelect"
    >
      <ElMenuItem v-for="menu in menus" :key="menu.index" :index="menu.index">
        <span>{{ menu.label }}</span>
      </ElMenuItem>
    </ElMenu>
  </div>
</template>

<style scoped>
.side-menus-container {
  position: relative;
  width: fit-content;
  height: 100%;
  padding: 1rem;
  border-right: 1px solid var(--el-border-color);
}
.side-menus {
  width: 100%;
  border-right: unset;
}
</style>
