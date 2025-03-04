<script setup lang="ts">
import { OrgAndUserMenu } from '../../types';
import { useGlobalStore } from '../../utils/vue';
import OrgManage from './org-manage.vue';
import OrgAndUserManageSideMenus from './side-menus.vue';

defineOptions({
  name: 'OrgAndUserManage',
});

const globalStore = useGlobalStore();

const { orgAndUserManage } = globalStore;
function setCurrentMenu(menu: OrgAndUserMenu) {
  orgAndUserManage.setCurrentMenu(menu);
}
</script>

<template>
  <div class="org-and-user-manage">
    <OrgAndUserManageSideMenus
      :current-menu="orgAndUserManage.currentMenu"
      @update:current-menu="setCurrentMenu"
    />
    <OrgManage v-if="orgAndUserManage.currentMenu === OrgAndUserMenu.Org" />
  </div>
</template>

<style scoped>
.org-and-user-manage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
