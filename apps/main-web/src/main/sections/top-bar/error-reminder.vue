<script setup lang="tsx">
import { computed, VNode } from 'vue';
import { useGlobalStore } from '../../utils';
import { ElLink, ElTooltip, ElIcon } from 'element-plus';
import { Bell } from '@element-plus/icons-vue';
import { useIsWebSize } from '@tk-crawler/view-shared';
import { useRouter } from 'vue-router';
import { GuildManagementRouteRecord } from '../../router/route-records';

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
      <component :is="errorMessage.title" :is-functional="true" />
    </template>
    <ElIcon :size="isWebSize ? 22 : 18" class="text-red-500 cursor-pointer">
      <Bell />
    </ElIcon>
  </ElTooltip>
</template>
