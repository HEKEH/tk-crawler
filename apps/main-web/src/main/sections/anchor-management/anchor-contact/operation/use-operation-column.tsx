import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { Column } from 'element-plus';
import { StarFilled } from '@element-plus/icons-vue';
import { getPlatform, openScheme, useIsWebSize } from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';
import { localStorageStore } from '../../../../utils';
import { useAnchorContact, type UseAnchorContactParams } from '../hooks';

export function useOperationColumn(props: {
  refetch: UseAnchorContactParams['refetch'];
}) {
  const isWeb = useIsWebSize();
  const { handleContactAnchor, handleCancelAnchorContact } =
    useAnchorContact(props);

  const hasNotifiedTKInstall = ref(
    localStorageStore.getItem('has_notified_TK_install') === '1',
  );

  async function gotoTKPage(anchor: DisplayedAnchorItem): Promise<boolean> {
    const platform = getPlatform();
    if (platform !== 'Android' && platform !== 'iOS') {
      try {
        await ElMessageBox.alert('该操作需要在手机端进行！', {
          type: 'warning',
        });
      } catch {}
      return false;
    }
    if (!hasNotifiedTKInstall.value) {
      try {
        await ElMessageBox.confirm('请确保手机已安装TK，再进行下一步操作', {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning',
        });
      } catch {
        return false;
      }
      hasNotifiedTKInstall.value = true;
      localStorageStore.setItem('has_notified_TK_install', '1');
    }
    const scheme = `snssdk1180://user/profile/${anchor.user_id}?refer=web&gd_label=click_wap_download_follow&type=need_follow&needlaunchlog=1`;
    try {
      await openScheme(scheme);
    } catch {
      ElMessage.error('打开链接失败');
      return false;
    }
    return true;
  }

  async function onContactAnchor(anchor: DisplayedAnchorItem) {
    const isSuccess = await gotoTKPage(anchor);
    if (isSuccess) {
      await handleContactAnchor([anchor]);
    }
  }

  const column = computed<Column<DisplayedAnchorItem>>(() => ({
    key: 'operation',
    title: '操作',
    width: isWeb.value ? 190 : 160,
    fixed: isWeb.value ? ('left' as any) : undefined,
    cellRenderer: ({ rowData }: { rowData: DisplayedAnchorItem }) => (
      <div class="operation-buttons">
        {rowData.assigned_user && !rowData.contacted_user ? (
          <ElButton
            class="bg-[var(--el-color-primary-dark-2)]"
            size="small"
            type="primary"
            onClick={() => onContactAnchor(rowData)}
          >
            <ElIcon>
              <StarFilled />
            </ElIcon>
            建联
          </ElButton>
        ) : rowData.contacted_user ? (
          <ElButton
            size="small"
            type="danger"
            onClick={() => handleCancelAnchorContact([rowData])}
          >
            重置建联
          </ElButton>
        ) : null}
        <ElButton
          size="small"
          type="primary"
          onClick={() => gotoTKPage(rowData)}
        >
          跳转
        </ElButton>
      </div>
    ),
  }));

  return {
    column,
  };
}
