<script setup lang="ts">
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { StarFilled } from '@element-plus/icons-vue';
import { getPlatform, openScheme } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElTableColumn,
} from 'element-plus';
import { ref } from 'vue';
import { localStorageStore } from '../../../../utils';
import { useAnchorContact, type UseAnchorContactParams } from '../hooks';

const props = defineProps<{
  refetch: UseAnchorContactParams['refetch'];
}>();

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

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
      await await ElMessageBox.confirm('请确保手机已安装TK，再进行下一步操作', {
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
</script>

<template>
  <ElTableColumn label="操作" v-bind="$attrs">
    <template #default="scope: ScopeType">
      <div class="operation-buttons">
        <ElButton
          v-if="scope.row.assigned_user && !scope.row.contacted_user"
          class="contact-anchor-button"
          size="small"
          type="primary"
          @click="onContactAnchor(scope.row)"
        >
          <ElIcon>
            <StarFilled />
          </ElIcon>
          建联
        </ElButton>
        <ElButton
          v-else-if="scope.row.contacted_user"
          size="small"
          type="danger"
          @click="handleCancelAnchorContact([scope.row])"
        >
          重置建联
        </ElButton>
        <ElButton size="small" type="primary" @click="gotoTKPage(scope.row)">
          跳转
        </ElButton>
      </div>
    </template>
  </ElTableColumn>
</template>

<style scoped>
.contact-anchor-button {
  background-color: var(--el-color-primary-dark-2);
}
</style>
