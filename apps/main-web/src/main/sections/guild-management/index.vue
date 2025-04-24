<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MenuSelect } from '../../components';
import { useGlobalStore } from '../../utils';
import TKGuildUserManage from './tk-guild-user-manage';

defineOptions({
  name: 'GuildManagement',
});

enum MenuType {
  TK_GUILD_USER = 'tk-guild-user',
}
const route = useRoute();
const router = useRouter();
const globalStore = useGlobalStore();
const hasPrivilege = computed(() => globalStore.userProfile.isAdmin);
const MenuList = [
  {
    value: MenuType.TK_GUILD_USER,
    label: '查询账号管理',
  },
];
const currentMenu = computed(() => {
  return (route.params.subMenu || MenuList[0]?.value) as MenuType | undefined;
});

function handleSelectMenu(key: string) {
  router.push({
    path: `/guild-management/${key as MenuType}`,
  });
}
</script>

<template>
  <div v-if="hasPrivilege" class="container">
    <div class="menu-part">
      <MenuSelect
        :menus="MenuList"
        :value="currentMenu"
        @select="handleSelectMenu"
      />
    </div>
    <div class="main-part">
      <KeepAlive>
        <TKGuildUserManage v-if="currentMenu === MenuType.TK_GUILD_USER" />
      </KeepAlive>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  @include mobile {
    flex-direction: column;
  }
  .menu-part {
    overflow: hidden;
    @include web {
      height: 100%;
      width: fit-content;
      border-right: 1px solid var(--el-border-color);
    }
    @include mobile {
      width: 100%;
      padding: 0.5rem 1rem 0;
      height: fit-content;
    }
  }
  .main-part {
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
