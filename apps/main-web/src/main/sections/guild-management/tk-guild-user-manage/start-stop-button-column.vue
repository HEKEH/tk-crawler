<script setup lang="tsx">
import type { GetTKGuildUserListResponseData } from '@tk-crawler/biz-shared';
// import { InfoFilled } from '@element-plus/icons-vue';
import {
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import {
  CUSTOM_EVENTS,
  MAIN_APP_ID,
  MAIN_APP_PRODUCT_NAME,
  MAIN_APP_PUBLISH_URL,
} from '@tk-crawler/main-client-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { getPlatform, isDesktopPlatform } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElLink,
  ElMessage,
  ElMessageBox,
  ElTableColumn,
} from 'element-plus';
import { toRaw } from 'vue';
import { stopTKGuildUserAccount } from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';

type TKGuildUserRow = GetTKGuildUserListResponseData['list'][number];

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
  (e: 'finish-operation'): void;
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
  if (
    status === TKGuildUserStatus.ERROR ||
    status === TKGuildUserStatus.COOKIE_EXPIRED
  ) {
    return { text: '停止', type: 'default' };
  }
  return null;
}

async function onStart(item: TKGuildUserRow) {
  if (!isInElectronApp()) {
    if (!isDesktopPlatform()) {
      ElMessage.warning('手机端无法支持此操作，请在桌面客户端中尝试');
      return;
    }
    try {
      const platform = getPlatform();
      await ElMessageBox({
        title: '提示',
        message: (
          <div>
            <div
              style={{
                width: '100%',
              }}
            >
              浏览器环境无法支持此功能，请在
              <span
                style={{
                  fontWeight: 'bold',
                }}
              >
                {`「${MAIN_APP_PRODUCT_NAME}」`}
              </span>
              中尝试。
            </div>
            <div
              style={{
                width: '100%',
              }}
            >
              如果你尚未安装应用，请前往
              <ElLink
                style={{
                  display: 'inline-block',
                  verticalAlign: 'baseline',
                  marginRight: '0.5rem',
                  marginLeft: '0.5rem',
                }}
                href={
                  platform === 'Mac'
                    ? `${MAIN_APP_PUBLISH_URL}/${MAIN_APP_PRODUCT_NAME}-Mac-Installer.dmg`
                    : `${MAIN_APP_PUBLISH_URL}/${MAIN_APP_PRODUCT_NAME}-Windows-Installer.exe`
                }
                target="_blank"
                type="primary"
                underline
              >
                下载页面
              </ElLink>
              安装。
            </div>
          </div>
        ),
        type: 'warning',
        confirmButtonText: '尝试打开客户端',
      });
      window.open(`${MAIN_APP_ID}://`);
    } catch {}
    return;
  }
  if (!globalStore.userProfile.hasMembership) {
    ElMessage.warning('您没有权限进行修改，请先开通会员');
    return;
  }
  await window.ipcRenderer.invoke(CUSTOM_EVENTS.GO_TO_GUILD_COOKIE_PAGE, {
    guildUser: toRaw(item),
  });
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
  emit('finish-operation');
  ElMessage.success('成功停止');
}

const getButtonConfig = (status: TKGuildUserStatus): ButtonConfig[] => {
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
      class: 'flex-0',
    },
  ];

  return configs.filter((config): config is ButtonConfig => Boolean(config));
};
</script>

<template>
  <ElTableColumn label="启动/停止" :min-width="160">
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
