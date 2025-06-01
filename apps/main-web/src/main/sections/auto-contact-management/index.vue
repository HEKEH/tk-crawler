<script setup lang="ts">
import { MenuSelect } from '@tk-crawler/view-shared';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AnchorCommentTemplateManage from './anchor-comment-template-manage';
import MobileDevicesManage from './mobile-devices-manage';

defineOptions({
  name: 'AutoContactManagement',
});

enum MenuType {
  ANCHOR_COMMENT_TEMPLATE = 'anchor_comment_template',
  MOBILE_DEVICE = 'mobile_device',
}

const MenuList = [
  {
    value: MenuType.ANCHOR_COMMENT_TEMPLATE,
    label: '评论模板管理',
  },
  {
    value: MenuType.MOBILE_DEVICE,
    label: '移动设备列表',
  },
];
const route = useRoute();
const router = useRouter();
const currentMenu = computed(() => {
  return (route.params.subMenu || MenuList[0]?.value) as MenuType | undefined;
});

function handleSelectMenu(key: string) {
  router.push({
    path: `/auto-contact-management/${key as MenuType}`,
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
        <AnchorCommentTemplateManage
          v-if="currentMenu === MenuType.ANCHOR_COMMENT_TEMPLATE"
        />
      </KeepAlive>
      <MobileDevicesManage v-if="currentMenu === MenuType.MOBILE_DEVICE" />
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
