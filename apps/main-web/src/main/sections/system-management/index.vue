<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MenuSelect } from '../../components';
import OrgMembersManage from './org-members-manage/index.vue';

defineOptions({
  name: 'SystemManagement',
});

enum MenuType {
  USER = 'user',
}

const MenuList = [
  {
    value: MenuType.USER,
    label: '用户管理',
  },
];
const route = useRoute();
const router = useRouter();
const currentMenu = computed(() => {
  return (route.params.subMenu || MenuList[0]?.value) as MenuType | undefined;
});

function handleSelectMenu(key: string) {
  router.push({
    path: `/system-management/${key as MenuType}`,
  });
}
</script>

<template>
  <div class="container">
    <div class="menu-part">
      <MenuSelect
        :menus="MenuList"
        :value="currentMenu"
        @select="handleSelectMenu"
      />
    </div>
    <div class="main-part">
      <KeepAlive>
        <OrgMembersManage v-if="currentMenu === MenuType.USER" />
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
