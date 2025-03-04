<script setup lang="ts">
import { ElLink } from 'element-plus';
import { Menu } from '../../types';
import { useGlobalStore } from '../../utils/vue';

defineOptions({
  name: 'LeftMenus',
});

const Menus = [
  {
    key: Menu.Entry,
    name: '主页',
  },
];

const globalStore = useGlobalStore();
</script>

<template>
  <div class="left-menus">
    <div v-for="menu in Menus" :key="menu.key" class="left-menu">
      <ElLink
        class="left-menu-item"
        :class="{ active: globalStore.currentMenu === menu.key }"
        :underline="false"
        @click="globalStore.setCurrentMenu(menu.key)"
      >
        {{ menu.name }}
      </ElLink>
    </div>
  </div>
</template>

<style scoped>
.left-menus {
  height: 100%;
  display: flex;
  align-items: center;
  column-gap: 3rem;

  .left-menu-item {
    font-size: 1rem;
    &.active {
      color: var(--el-color-primary);
    }
  }
}
</style>
