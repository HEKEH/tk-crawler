<script setup lang="ts">
import { MenuIcon } from '@tk-crawler/assets';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElDrawer, ElLink } from 'element-plus';
import { computed, ref } from 'vue';
import { Page } from '../../types';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'Menus',
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
function handleClick(item: { key: Page; name: string }) {
  if (item.key === globalStore.currentPage) {
    return;
  }
  globalStore.setCurrentMenu(item.key);
}
const isWeb = useIsWebSize();

const drawerVisible = ref(false);
</script>

<template>
  <div v-if="isWeb" class="h-full flex items-center gap-12">
    <div v-for="item in Menus" :key="item.key">
      <ElLink
        class="text-base hover:text-[var(--el-color-primary)]"
        :class="{
          'text-[var(--el-color-primary)]':
            globalStore.currentPage === item.key,
        }"
        :underline="false"
        @click="handleClick(item)"
      >
        {{ item.name }}
      </ElLink>
    </div>
  </div>
  <div v-else class="h-full flex items-center">
    <MenuIcon
      class="text-[var(--el-text-color-regular)]"
      @click="drawerVisible = true"
    />
    <ElDrawer v-model="drawerVisible" append-to-body :size="180">
      <div class="w-full flex flex-col items-center gap-4">
        <ElLink
          v-for="item in Menus"
          :key="item.key"
          class="text-base hover:text-[var(--el-color-primary)]"
          :class="{
            'text-[var(--el-color-primary)]':
              globalStore.currentPage === item.key,
          }"
          @click="handleClick(item)"
        >
          {{ item.name }}
        </ElLink>
      </div>
    </ElDrawer>
  </div>
</template>
