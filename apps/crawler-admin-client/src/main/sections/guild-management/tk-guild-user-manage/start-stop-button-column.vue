<script setup lang="tsx">
import type { GetTKGuildUserListResponseData } from '@tk-crawler/biz-shared';
// import { InfoFilled } from '@element-plus/icons-vue';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import {
  getPlatform,
  isDesktopPlatform,
  openScheme,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElLink,
  ElMessage,
  ElMessageBox,
  ElTableColumn,
} from 'element-plus';
import { computed, toRaw } from 'vue';
import { APP_ID, PRODUCT_NAME, PUBLISH_URL } from '../../../constants';
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
  (e: 'finishOperation'): void;
}>();

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);

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
                {`「${PRODUCT_NAME}」`}
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
                    ? `${PUBLISH_URL}/${PRODUCT_NAME}-Mac-Installer.dmg`
                    : `${PUBLISH_URL}/${PRODUCT_NAME}-Windows-Installer.exe`
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
    } catch {
      return;
    }
    try {
      await openScheme(`${APP_ID}://`);
    } catch {
      ElMessage.error('打开客户端失败，请手动打开');
      return;
    }
    return;
  }
  await window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.GO_TO_GUILD_COOKIE_PAGE,
    {
      guildUser: toRaw(item),
    },
  );
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
    token.value,
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
