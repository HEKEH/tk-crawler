<script setup lang="ts">
// import { useGlobalStore } from '../../utils/vue';
import OrgAndUserManageSideMenus from './side-menus.vue';

defineOptions({
  name: 'OrgAndUserManage',
});

// const globalStore = useGlobalStore();

// const crawlerManage = globalStore.crawlerManage;
</script>

<template>
  <div class="org-and-user-manage">
    <OrgAndUserManageSideMenus />
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
