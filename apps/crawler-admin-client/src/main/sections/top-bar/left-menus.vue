<script setup lang="ts">
import { ElLink } from 'element-plus';
import { computed } from 'vue';
import { Page } from '../../types';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'LeftMenus',
});

const globalStore = useGlobalStore();

const Menus = computed(() => {
  if (globalStore.currentPage === Page.Login) {
    return [
      {
        key: Page.Login,
        name: '登录',
      },
    ];
  }
  return [
    {
      key: Page.Crawler,
      name: '爬虫管理',
    },
    {
      key: Page.Client,
      name: '客户管理',
    },
  ];
});
</script>

<template>
  <div class="left-menus">
    <div v-for="menu in Menus" :key="menu.key" class="left-menu">
      <ElLink
        class="left-menu-item"
        :class="{ active: globalStore.currentPage === menu.key }"
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
