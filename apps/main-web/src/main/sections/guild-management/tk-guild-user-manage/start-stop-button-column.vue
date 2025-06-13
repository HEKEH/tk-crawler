<script setup lang="tsx">
import type { TKGuildUserRow } from './types';
// import { InfoFilled } from '@element-plus/icons-vue';
import {
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { ElButton, ElMessage, ElMessageBox, ElTableColumn } from 'element-plus';
import { stopTKGuildUserAccount } from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import { onStartGuildUsers } from './utils';

interface ScopeType {
  row: TKGuildUserRow;
}

interface ButtonConfig {
  text: string;
  type: 'default' | 'success' | 'danger';
  handler: (row: TKGuildUserRow) => Promise<void>;
  class: string;
}

const emit = defineEmits<{
  (e: 'finishOperation'): void;
}>();

const globalStore = useGlobalStore();

function getStartButtonTextAndType(
  status: TKGuildUserStatus,
): { text: string; type: 'success' | 'danger' } | null {
  if (VALID_GUILD_USER_STATUS_LIST.includes(status)) {
    return null;
  }
  if (
    status === TKGuildUserStatus.ERROR ||
    status === TKGuildUserStatus.COOKIE_EXPIRED
  ) {
    return { text: '重新启动', type: 'success' };
  }
  return { text: '启动查询', type: 'success' };
}

function getStopButtonTextAndType(
  status: TKGuildUserStatus,
): { text: string; type: 'success' | 'danger' | 'default' } | null {
  if (VALID_GUILD_USER_STATUS_LIST.includes(status)) {
    return { text: '停止查询', type: 'danger' };
  }
  // if (
  //   status === TKGuildUserStatus.ERROR ||
  //   status === TKGuildUserStatus.COOKIE_EXPIRED
  // ) {
  //   return { text: '停止', type: 'default' };
  // }
  return null;
}

async function onStart(item: TKGuildUserRow) {
  await onStartGuildUsers([item], globalStore.userProfile.hasMembership);
}

async function onStop(item: TKGuildUserRow) {
  try {
    await ElMessageBox.confirm('确定要停止查询吗？', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  const result = await stopTKGuildUserAccount(
    { user_id: item.id },
    globalStore.token,
  );
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  emit('finishOperation');
  ElMessage.success('成功停止');
}

function getButtonConfig(status: TKGuildUserStatus): ButtonConfig[] {
  const startConfig = getStartButtonTextAndType(status);
  const stopConfig = getStopButtonTextAndType(status);

  const configs: (ButtonConfig | null)[] = [
    startConfig && {
      text: startConfig.text,
      type: startConfig.type,
      handler: onStart,
      class: 'flex-1',
    },
    stopConfig && {
      text: stopConfig.text,
      type: stopConfig.type,
      handler: onStop,
      class: startConfig ? 'flex-0' : 'flex-1',
    },
  ];

  return configs.filter((config): config is ButtonConfig => Boolean(config));
}
</script>

<template>
  <ElTableColumn label="启动/停止" :min-width="120">
    <template #default="scope: ScopeType">
      <div class="flex">
        <ElButton
          v-for="(config, index) in getButtonConfig(scope.row.status)"
          :key="index"
          :class="config.class"
          size="small"
          :type="config.type"
          @click="config.handler(scope.row)"
        >
          {{ config.text }}
        </ElButton>
      </div>
    </template>
  </ElTableColumn>
</template>
