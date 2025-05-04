import type { ElTable } from 'element-plus';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';

interface UseTableSortParams {
  tableRef: Ref<InstanceType<typeof ElTable> | undefined>;
  pageNum: Ref<number>;
  onSortChange?: (
    sortField: string | undefined,
    sortOrder: 'ascending' | 'descending' | undefined,
  ) => void;
}
export function useTableSort<T>({
  tableRef,
  pageNum,
  onSortChange,
}: UseTableSortParams) {
  const sortField = ref<string>();
  const sortOrder = ref<'ascending' | 'descending'>();
  const orderBy = computed<T | undefined>(() => {
    return sortField.value
      ? ({
          [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc',
        } as T)
      : undefined;
  });

  // 处理排序变化
  function handleSortChange(
    params:
      | {
          prop: string;
          order: 'ascending' | 'descending' | null;
        }
      | undefined,
  ) {
    const { prop, order } = params ?? {};
    sortField.value = order ? prop : undefined;
    sortOrder.value = order || undefined;
    pageNum.value = 1;
    onSortChange?.(sortField.value, sortOrder.value);
  }

  function resetSort() {
    if (sortField.value) {
      tableRef.value?.clearSort();
      sortField.value = undefined;
      sortOrder.value = undefined;
      pageNum.value = 1;
      onSortChange?.(undefined, undefined);
    }
  }
  return {
    sortField,
    sortOrder,
    orderBy,
    handleSortChange,
    resetSort,
  };
}
