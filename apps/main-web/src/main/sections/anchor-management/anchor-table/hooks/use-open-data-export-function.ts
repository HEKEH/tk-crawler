import { useClickMultipleTimes } from '@tk-crawler/view-shared';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { localStorageStore } from '../../../../utils';

export const EXPORT_DATA_FUNCTION_IS_OPENED_KEY =
  'export-data-function-is-opened';

export function useOpenDataExportFunction() {
  const router = useRouter();
  const isClickMultipleTimes = useClickMultipleTimes(6, 1000);
  const onClickMultipleTimes = () => {
    if (isClickMultipleTimes()) {
      if (!localStorageStore.getItem(EXPORT_DATA_FUNCTION_IS_OPENED_KEY)) {
        localStorageStore.setItem('export-data-function-is-opened', '1');
      } else {
        localStorageStore.removeItem(EXPORT_DATA_FUNCTION_IS_OPENED_KEY);
      }
      router.go(0);
    }
  };
  const isUnmount = ref(false);
  onMounted(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 等待异步组件加载完成
    if (isUnmount.value) {
      return;
    }
    const paginationTotal = document.querySelector(
      '.tk-anchor-user-table .el-pagination__total',
    );
    if (!paginationTotal) {
      console.error('paginationTotal not found');
      return;
    }
    paginationTotal.addEventListener('click', onClickMultipleTimes);
  });
  onBeforeUnmount(() => {
    isUnmount.value = true;
    const paginationTotal = document.querySelector(
      '.tk-anchor-user-table .el-pagination__total',
    );
    if (!paginationTotal) {
      throw new Error('paginationTotal not found');
    }
    paginationTotal.removeEventListener('click', onClickMultipleTimes);
  });
}
