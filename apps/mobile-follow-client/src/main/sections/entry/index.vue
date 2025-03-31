<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import { ref } from 'vue';
import AnchorCommentTemplateSection from './anchor-comment-template-section/index.vue';
import AnchorSection from './anchor-section/index.vue';
import GroupSection from './group-section/index.vue';

defineOptions({
  name: 'Entry',
});

enum MenuType {
  ANCHOR = 'anchor',
  GROUP = 'group',
  ANCHOR_COMMENT_TEMPLATE = 'anchor-comment-template',
}

const currentMenu = ref<MenuType>(MenuType.ANCHOR);

function handleSelectMenu(key: string) {
  currentMenu.value = key as MenuType;
}

const MenuList = [
  {
    type: MenuType.ANCHOR,
    label: '主播列表',
  },
  {
    type: MenuType.GROUP,
    label: '分组管理',
  },
  {
    type: MenuType.ANCHOR_COMMENT_TEMPLATE,
    label: '主播评论模板',
  },
];
</script>

<template>
  <div class="entry">
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
        <AnchorSection v-if="currentMenu === MenuType.ANCHOR" />
      </KeepAlive>
      <KeepAlive>
        <Suspense v-if="currentMenu === MenuType.GROUP">
          <GroupSection />
        </Suspense>
      </KeepAlive>
      <KeepAlive>
        <Suspense v-if="currentMenu === MenuType.ANCHOR_COMMENT_TEMPLATE">
          <AnchorCommentTemplateSection />
        </Suspense>
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.entry {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  .left-part {
    width: 140px;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color);
  }
  .right-part {
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .side-menus {
    width: 100%;
    border-right: unset;
  }
}
</style>
