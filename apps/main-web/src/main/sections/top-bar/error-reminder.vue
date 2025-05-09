<script setup lang="tsx">
import type { VNode } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { ElIcon, ElLink, ElTooltip } from 'element-plus';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { GuildManagementRouteRecord } from '../../router/route-records';
import { useGlobalStore } from '../../utils';

const globalStore = useGlobalStore();

const isAdmin = computed(() => {
  return globalStore.userProfile.isAdmin;
});

const router = useRouter();

const errorMessage = computed<{
  title: string | VNode;
} | null>(() => {
  if (globalStore.guildAccountsManage.isAnyAccountError) {
    if (isAdmin.value) {
      return {
        title: (
          <div class="flex items-center">
            某些公会账号登录已过期或出错，请前往
            <ElLink
              class="mx-1 text-xs"
              type="primary"
              onClick={() =>
                router.push(
                  GuildManagementRouteRecord.jumpTo ??
                    GuildManagementRouteRecord.path,
                )
              }
            >
              公会管理
            </ElLink>
            及时处理
          </div>
        ),
      };
    } else {
      return {
        title: '某些公会账号登录已过期或出错，请及时联系管理员处理',
      };
    }
  }
  return null;
});

const isWebSize = useIsWebSize();
</script>

<template>
  <ElTooltip v-if="errorMessage" open>
    <template #content>
      <span v-if="typeof errorMessage.title === 'string'">
        {{ errorMessage.title }}
      </span>
      <component :is="errorMessage.title" v-else :is-functional="true" />
    </template>
    <ElIcon :size="isWebSize ? 22 : 18" class="text-red-500 cursor-pointer">
      <Bell />
    </ElIcon>
  </ElTooltip>
</template>
