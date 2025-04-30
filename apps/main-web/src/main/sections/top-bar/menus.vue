<script setup lang="ts">
import { MenuIcon } from '@tk-crawler/assets';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElDrawer, ElLink } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'Menus',
});
const globalStore = useGlobalStore();
const router = useRouter();
function handleClick(item: (typeof globalStore.menus)[number]) {
  router.push(item.jumpTo ?? item.path);
}
const isWeb = useIsWebSize();

const drawerVisible = ref(false);
</script>

<template>
  <div v-if="isWeb" class="menus-web">
    <div v-for="item in globalStore.menus" :key="item.menu" class="left-menu">
      <ElLink
        class="menu-item"
        :class="{ active: globalStore.currentMenu === item.menu }"
        :underline="false"
        @click="handleClick(item)"
      >
        {{ item.name }}
      </ElLink>
    </div>
  </div>
  <div v-else class="menus-mobile">
    <MenuIcon class="menu-icon" @click="drawerVisible = true" />
    <ElDrawer
      v-model="drawerVisible"
      append-to-body
      :show-close="false"
      :size="180"
      class="menu-drawer"
    >
      <div class="menu-list">
        <ElLink
          v-for="item in globalStore.menus"
          :key="item.menu"
          class="menu-item"
          :class="{ active: globalStore.currentMenu === item.menu }"
          @click="handleClick(item)"
        >
          {{ item.name }}
        </ElLink>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped>
.menus-web {
  height: 100%;
  display: flex;
  align-items: center;
  column-gap: 3rem;

  .menu-item {
    font-size: 1rem;
    &.active {
      color: var(--el-color-primary);
    }
  }
}
.menus-mobile {
  height: 100%;
  display: flex;
  align-items: center;
  .menu-icon {
    color: var(--el-text-color-regular);
  }
}
.menu-drawer {
  :global(.el-drawer__header) {
    display: none;
  }
  .menu-list {
    padding: 20px 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .menu-item {
    font-size: 1rem;
    &.active {
      color: var(--el-color-primary);
    }
  }
}
</style>
