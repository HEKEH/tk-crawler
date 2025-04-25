<script setup lang="ts">
import { StarFilled } from '@element-plus/icons-vue';
import type { DisplayedAnchorItem } from '@tk-crawler/biz-shared';
import { getPlatform, openScheme } from '@tk-crawler/view-shared';
import type { TableColumnCtx } from 'element-plus';
import {
  ElButton,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElTableColumn,
} from 'element-plus';
import { useAnchorContact, type UseAnchorContactParams } from '../hooks';
import { ref } from 'vue';

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

const hasOpenedTK = ref(false);

async function onFollowAnchor(anchor: DisplayedAnchorItem) {
  const platform = getPlatform();
  if (platform !== 'Android' && platform !== 'iOS') {
    try {
      await ElMessageBox.alert('关注操作需要在手机端进行！');
    } catch {}
    return;
  }
  if (!hasOpenedTK.value) {
    try {
      await await ElMessageBox.confirm('请确保手机已安装TK，再进行下一步操作', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning',
      });
    } catch {
      return;
    }
    hasOpenedTK.value = true;
  }
  const scheme = `snssdk1180://user/profile/${anchor.user_id}?refer=web&gd_label=click_wap_download_follow&type=need_follow&needlaunchlog=1`;
  try {
    await openScheme(scheme);
  } catch {
    ElMessage.error('打开链接失败');
    return;
  }
  await handleContactAnchor([anchor]);
}
</script>

<template>
  <ElTableColumn label="操作" v-bind="$attrs">
    <template #default="scope: ScopeType">
      <div class="operation-buttons">
        <ElButton
          v-if="scope.row.assigned_user && !scope.row.contacted_user"
          size="small"
          type="primary"
          @click="onFollowAnchor(scope.row)"
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
      </div>
    </template>
  </ElTableColumn>
</template>
