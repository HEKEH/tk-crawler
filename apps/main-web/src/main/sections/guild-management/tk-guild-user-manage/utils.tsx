import type { TKGuildUserRow } from './types';
// import { InfoFilled } from '@element-plus/icons-vue';
import {
  GUILD_COOKIE_PAGE_HELP_EVENTS,
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import {
  MAIN_APP_ID,
  MAIN_APP_PRODUCT_NAME,
} from '@tk-crawler/main-client-shared';
import {
  getPlatform,
  isDesktopPlatform,
  openScheme,
} from '@tk-crawler/view-shared';
import { ElLink, ElMessage, ElMessageBox } from 'element-plus';
import { toRaw } from 'vue';
import { getAppDownloadUrl } from '../../../utils';

// 获取状态标签类型
export function getStatusTagType(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return 'success';
    case TKGuildUserStatus.STOPPED:
      return 'info';
    case TKGuildUserStatus.ERROR:
      return 'danger';
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return 'danger';
    case TKGuildUserStatus.WAITING:
      return 'primary';
    case TKGuildUserStatus.INACTIVE:
      return 'info';
    case TKGuildUserStatus.WARNING:
      return 'warning';
    default:
      return 'info';
  }
}

export function getStatusTip(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return '由于TK严格的风控机制，一次激活并不能保证Cookie后续验证通过，可能需要重复激活数次后，Cookie才能正常使用';
    default:
      return undefined;
  }
}

export async function onStartGuildUsers(
  data: TKGuildUserRow[],
  hasMembership: boolean,
) {
  const items = data.filter(
    item => !VALID_GUILD_USER_STATUS_LIST.includes(item.status),
  );
  if (items.length === 0) {
    ElMessage.warning('没有需要激活的账号');
    return;
  }
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
                    ? getAppDownloadUrl('Mac')
                    : getAppDownloadUrl('Windows')
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
      await openScheme(`${MAIN_APP_ID}://`);
    } catch {
      ElMessage.error('打开客户端失败，请手动打开');
      return;
    }
    return;
  }
  if (!hasMembership) {
    ElMessage.warning('您没有权限进行修改，请先开通会员');
    return;
  }
  await window.ipcRenderer.invoke(
    GUILD_COOKIE_PAGE_HELP_EVENTS.GO_TO_GUILD_COOKIE_PAGE,
    {
      guildUser: items.map(item => toRaw(item)),
    },
  );
}
