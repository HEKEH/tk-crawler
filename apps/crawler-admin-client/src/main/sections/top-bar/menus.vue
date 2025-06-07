<script setup lang="ts">
import { MenuIcon } from '@tk-crawler/assets';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElDrawer, ElLink } from 'element-plus';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../utils';

defineOptions({
  name: 'Menus',
});
const globalStore = useGlobalStore();
const router = useRouter();

const allPages = computed(() => globalStore.allPages);

function handleClick(item: (typeof globalStore.allPages)[number]) {
  if (item.menu === globalStore.currentPage) {
    return;
  }
  router.push(item.jumpTo ?? item.path);
}
const isWeb = useIsWebSize();

const drawerVisible = ref(false);
</script>

<template>
  <div v-if="isWeb" class="h-full flex items-center gap-12">
    <div v-for="item in allPages" :key="item.menu">
      <ElLink
        class="text-base hover:text-[var(--el-color-primary)]"
        :class="{
          'text-[var(--el-color-primary)]':
            globalStore.currentPage === item.menu,
        }"
        underline="never"
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
          v-for="item in allPages"
          :key="item.menu"
          class="text-base hover:text-[var(--el-color-primary)]"
          :class="{
            'text-[var(--el-color-primary)]':
              globalStore.currentPage === item.menu,
          }"
          @click="handleClick(item)"
        >
          {{ item.name }}
        </ElLink>
      </div>
    </ElDrawer>
  </div>
</template>
