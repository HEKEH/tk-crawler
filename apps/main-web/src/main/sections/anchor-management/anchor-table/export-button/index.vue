<script setup lang="ts">
import type { GetAnchorListFilter } from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import {
  downloadCSV,
  downloadXLSX,
  useIsWebSize,
} from '@tk-crawler/view-shared';
import { ElButton, ElDialog, ElMessage } from 'element-plus';
import { ref } from 'vue';
import { getAnchorListForDownload } from '../../../../requests';
import { useGlobalStore } from '../../../../utils';
import ExportDialogContent from './export-dialog-content.vue';

const props = defineProps<{
  queryFilter: GetAnchorListFilter;
  filename: string;
}>();

const isLoading = ref(false);
const globalStore = useGlobalStore();
const isDialogVisible = ref(false);
const isWebSize = useIsWebSize();
const count = ref<number | undefined>(undefined);
const format = ref<'xlsx' | 'csv' | 'txt'>('xlsx');

async function handleExport() {
  if (isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;
    const response = await getAnchorListForDownload(
      {
        filter: props.queryFilter,
        number: count.value,
      },
      globalStore.token,
    );
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    const { list } = response.data!;

    if (!list.length) {
      ElMessage.warning('没有数据可以导出');
      return;
    }
    if (format.value === 'csv' || format.value === 'txt') {
      downloadCSV(list, {
        filename: props.filename,
        columns: [
          {
            key: 'user_id',
            label: '主播ID',
          },
          {
            key: 'display_id',
            label: '主播展示ID',
          },
        ],
        suffix: format.value,
      });
    } else {
      downloadXLSX(list, {
        filename: props.filename,
        columns: [
          {
            key: 'user_id',
            label: '主播ID',
            width: 30,
          },
          {
            key: 'display_id',
            label: '主播展示ID',
            width: 30,
          },
        ],
      });
    }
    closeDialog();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

function handleUpdate(val: number | undefined) {
  count.value = val;
}
function handleFormatChange(val: 'xlsx' | 'csv' | 'txt') {
  format.value = val;
}

function openDialog() {
  isDialogVisible.value = true;
}
function closeDialog() {
  isDialogVisible.value = false;
  count.value = undefined;
  format.value = 'xlsx';
}
</script>

<template>
  <ElButton :loading="isLoading" size="small" @click="openDialog">
    {{ isLoading ? '导出中' : '导出' }}
  </ElButton>
  <ElDialog
    :model-value="isDialogVisible"
    title="导出提示"
    width="400px"
    destroy-on-close
    class="[&_.el-dialog\_\_header]:pb-0 [&_.dialog-container]:!p-0"
    @update:model-value="closeDialog"
    @close="closeDialog"
  >
    <ExportDialogContent
      :value="count"
      :format="format"
      @update="handleUpdate"
      @format-change="handleFormatChange"
    />
    <template #footer>
      <div class="flex w-full justify-center">
        <ElButton
          :loading="isLoading"
          :size="isWebSize ? 'default' : 'small'"
          type="primary"
          @click="handleExport"
        >
          导出
        </ElButton>
        <ElButton :size="isWebSize ? 'default' : 'small'" @click="closeDialog">
          取消
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
