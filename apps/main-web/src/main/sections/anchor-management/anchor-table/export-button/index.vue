<script setup lang="ts">
import type { GetAnchorListFilter } from '@tk-crawler/biz-shared';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { downloadCSV, downloadXLSX } from '@tk-crawler/view-shared';
import { ElButton, ElMessage, ElMessageBox } from 'element-plus';
import { h, ref } from 'vue';
import { getAnchorListForDownload } from '../../../../requests';
import { useGlobalStore } from '../../../../utils';
import ExportDialogContent from './export-dialog-content.vue';

const props = defineProps<{
  queryFilter: GetAnchorListFilter;
  filename: string;
}>();

const isLoading = ref(false);
const globalStore = useGlobalStore();

async function handleExport() {
  if (isLoading.value) {
    return;
  }

  const count = ref<number | undefined>(undefined);
  const format = ref<'xlsx' | 'csv' | 'txt'>('xlsx');

  try {
    try {
      await ElMessageBox({
        title: '导出提示',
        message: h(ExportDialogContent, {
          value: count.value,
          format: format.value,
          onUpdate: val => {
            count.value = val;
          },
          onFormatChange: val => {
            format.value = val;
          },
        }),
        showCancelButton: true,
        confirmButtonText: '继续',
        cancelButtonText: '取消',
      });
    } catch {
      return;
    }

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
      return;
    }
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
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <ElButton :loading="isLoading" size="small" @click="handleExport">
    {{ isLoading ? '导出中' : '导出' }}
  </ElButton>
</template>
