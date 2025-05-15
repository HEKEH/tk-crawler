<script setup lang="ts">
import { MenuSelect } from '@tk-crawler/view-shared';
import { ref } from 'vue';
import TKGuildUserManage from './tk-guild-user-manage';

defineOptions({
  name: 'GuildManagement',
});

enum MenuType {
  TK_GUILD_USER = 'tk-guild-user',
}
const MenuList = [
  {
    value: MenuType.TK_GUILD_USER,
    label: '查询账号管理',
  },
];
const currentMenu = ref(MenuList[0]?.value);

function handleSelectMenu(key: string) {
  currentMenu.value = key as MenuType;
}
</script>

<template>
  <div class="outer-container">
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
.outer-container {
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
