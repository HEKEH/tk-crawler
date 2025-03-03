<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { useGlobalStore } from '../../utils/vue';

defineOptions({
  name: 'OrgAndUserManageSideMenus',
});
</script>

<template>
  <div class="side-menus-container">
    <ElMenu class="side-menus">
      <ElMenuItem index="org">
        <span>机构管理</span>
      </ElMenuItem>
      <ElMenuItem index="user">
        <span>用户管理</span>
      </ElMenuItem>
    </ElMenu>
  </div>
</template>

<style scoped>
.side-menus-container {
  position: relative;
  width: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.side-menus {
  width: 100%;
  border-right: unset;
}
</style>
