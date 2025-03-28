<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalStore } from '../../utils';
import GuildTable from './guild-table.vue';

defineOptions({
  name: 'GuildManagement',
});

enum MenuType {
  TK_GUILD_USER = 'tk-guild-user',
}
const route = useRoute();
const router = useRouter();
const globalStore = useGlobalStore();
const MenuList = computed(() =>
  globalStore.userProfile.isAdmin
    ? [
        {
          type: MenuType.TK_GUILD_USER,
          label: 'TK公会账号管理',
        },
      ]
    : [],
);
const currentMenu = computed(() => {
  return (route.params.subMenu || MenuList.value[0]?.type) as MenuType;
});

function handleSelectMenu(key: string) {
  router.push({
    path: `/guild-management/${key as MenuType}`,
  });
}
</script>

<template>
  <div class="container">
    <div class="left-part">
      <ElMenu
        :default-active="currentMenu"
        class="side-menus"
        @select="handleSelectMenu"
      >
        <ElMenuItem
          v-for="menu in MenuList"
          :key="menu.type"
          :index="menu.type"
        >
          <span>{{ menu.label }}</span>
        </ElMenuItem>
      </ElMenu>
    </div>
    <div class="right-part">
      <KeepAlive>
        <GuildTable v-if="currentMenu === MenuType.TK_GUILD_USER" />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  .left-part {
    width: fit-content;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);
  }
  .right-part {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  .side-menus {
    width: 100%;
    border-right: unset;
  }
}
</style>
