<script setup lang="ts">
import { ElLink } from 'element-plus';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'LeftMenus',
});
const globalStore = useGlobalStore();
const router = useRouter();
function handleClick(item: (typeof globalStore.menus)[number]) {
  router.push(item.jumpTo ?? item.path);
}
</script>

<template>
  <div class="left-menus">
    <div v-for="item in globalStore.menus" :key="item.menu" class="left-menu">
      <ElLink
        class="left-menu-item"
        :class="{ active: globalStore.currentMenu === item.menu }"
        :underline="false"
        @click="handleClick(item)"
      >
        {{ item.name }}
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
