<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MenuSelect } from '../../components';
import { useGlobalStore } from '../../utils';
import AnchorContactTable from './anchor-contact';
import AnchorTable from './anchor-table';

defineOptions({
  name: 'AnchorManagement',
});

const globalStore = useGlobalStore();

enum MenuType {
  ANCHOR_TABLE = 'anchor-table',
  ANCHOR_CONTACT = 'anchor-contact',
}
const route = useRoute();
const router = useRouter();
const anchorTableMenu = {
  value: MenuType.ANCHOR_TABLE,
  label: '主播列表',
};
const anchorContactMenu = {
  value: MenuType.ANCHOR_CONTACT,
  label: '主播建联',
};
const MenuList = computed(() =>
  globalStore.userProfile.isAdmin
    ? [anchorTableMenu, anchorContactMenu]
    : [anchorContactMenu, anchorTableMenu],
);
const currentMenu = computed(() => {
  return (route.params.subMenu || MenuList.value[0].value) as MenuType;
});

function handleSelectMenu(value: MenuType) {
  router.push({
    path: `/anchor-management/${value}`,
  });
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
        <AnchorTable v-if="currentMenu === MenuType.ANCHOR_TABLE" />
      </KeepAlive>
      <KeepAlive>
        <AnchorContactTable v-if="currentMenu === MenuType.ANCHOR_CONTACT" />
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
