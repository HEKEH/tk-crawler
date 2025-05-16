import type { VirtualizedTableColumn } from '@tk-crawler/view-shared';
import { StarFilled } from '@element-plus/icons-vue';
import {
  type DisplayedAnchorItem,
  getTiktokAnchorLink,
} from '@tk-crawler/biz-shared';
import {
  isMobilePlatform,
  openScheme,
  useIsWebSize,
} from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElMessage, ElMessageBox } from 'element-plus';
import { computed, markRaw, ref, toRaw } from 'vue';
import { clearAnchorCheck } from '../../../../requests';
import { localStorageStore, useGlobalStore } from '../../../../utils';
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

  const globalStore = useGlobalStore();

  const log = (...args: any[]) => {
    // TODO: close
    console.log(...args);
  };

  const gotoTKPage = markRaw(
    async (anchor: DisplayedAnchorItem): Promise<boolean> => {
      log('尝试打开TK页面');
      try {
        console.log('判断是否是手机端');
        if (!isMobilePlatform()) {
          log('不是移动端');
          try {
            await ElMessageBox.alert('该操作需要在手机端进行！', {
              type: 'warning',
            });
          } catch {}
          return false;
        }
        log('判断是否已通知安装TK');
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
        log('开始获取跳转链接');
        const scheme = getTiktokAnchorLink(anchor, true, true);
        log('获取跳转链接', scheme);
        try {
          log('尝试打开TK链接');
          await openScheme(scheme);
        } catch (e) {
          console.error(e);
          ElMessage.error((e as Error)?.message);
          // ElMessage.error('打开TK失败，请确保手机已安装TK');
          return false;
        }
        return true;
      } catch (e) {
        console.error(e);
        ElMessage.error((e as Error)?.message);
        return false;
      }
    },
  );

  const anchorTryToContact = ref<string>();
  const onContactAnchor = markRaw(async (anchor: DisplayedAnchorItem) => {
    if (anchorTryToContact.value === anchor.id) {
      return;
    }
    console.log('建联开始');
    try {
      anchorTryToContact.value = anchor.id;
      const isSuccess = await gotoTKPage(anchor);
      if (isSuccess) {
        await handleContactAnchor([anchor]);
      }
    } catch (e) {
      ElMessage.error((e as Error)?.message);
      console.error(e);
    } finally {
      anchorTryToContact.value = undefined;
    }
  });

  async function ignoreAnchor(anchor: DisplayedAnchorItem) {
    try {
      await ElMessageBox.confirm(`确定跳过主播 「${anchor.display_id}」`, {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning',
      });
    } catch {
      return false;
    }
    await clearAnchorCheck(
      {
        filter: {
          id: anchor.id,
        },
      },
      globalStore.token,
    );
    await props.refetch();
    ElMessage.success('已跳过');
  }

  const cellRenderer = markRaw(
    ({ rowData }: { rowData: DisplayedAnchorItem }) => (
      <div class="operation-buttons">
        {rowData.assigned_user && !rowData.contacted_user ? (
          <ElButton
            class="bg-[var(--el-color-primary-dark-2)]"
            size="small"
            type="primary"
            onClick={() => onContactAnchor(toRaw(rowData))}
            loading={anchorTryToContact.value === rowData.id}
          >
            {anchorTryToContact.value !== rowData.id && (
              <ElIcon>
                <StarFilled />
              </ElIcon>
            )}
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
          type="info"
          onClick={() => ignoreAnchor(rowData)}
        >
          跳过
        </ElButton>
      </div>
    ),
  );

  const column = computed<VirtualizedTableColumn<DisplayedAnchorItem>>(() => ({
    key: 'operation',
    title: '操作',
    width: 160,
    fixed: isWeb.value ? ('left' as const) : undefined,
    cellRenderer,
  }));

  return {
    column,
  };
}
