import { computed, ref, type Ref, watch } from 'vue';

export interface UseTableMultiSelectOptions<T> {
  rowKey?: keyof T | ((row: T) => string);
  defaultSelectedRowKeys?: string[];
}

export interface UseTableMultiSelectReturn<T> {
  selectedRowIds: Ref<string[]>;
  selectedRows: Ref<T[]>;
  onToggleRowSelect: (row: T) => void;
  onToggleAllRowSelect: () => void;
  isRowSelected: (row: T) => boolean;
  isAllRowSelected: Ref<boolean>;
  isPartialSelected: Ref<boolean>;
  clearSelection: () => void;
  setSelectedRows: (rows: T[]) => void;
}

export function useTableMultiSelect<T extends Record<string, any>>(
  tableData: Ref<T[] | undefined>,
  options: UseTableMultiSelectOptions<T> = {},
): UseTableMultiSelectReturn<T> {
  // 处理rowKey选项
  const getRowKey = (row: T): string => {
    if (typeof options.rowKey === 'function') {
      return options.rowKey(row);
    }
    if (typeof options.rowKey === 'string') {
      return String(row[options.rowKey]);
    }
    return String(row.id);
  };

  // 使用Map存储选中状态
  const selectedRowMap = ref<Record<string, boolean>>({});

  // 监听数据变化，清空选择
  watch(tableData, () => {
    selectedRowMap.value = {};
  });

  // 切换单行选择状态
  const onToggleRowSelect = (row: T) => {
    const rowKey = getRowKey(row);
    if (selectedRowMap.value[rowKey]) {
      delete selectedRowMap.value[rowKey];
    } else {
      selectedRowMap.value[rowKey] = true;
    }
  };

  // 判断行是否被选中
  const isRowSelected = (row: T): boolean => {
    return Boolean(selectedRowMap.value[getRowKey(row)]);
  };

  // 计算全选状态
  const isAllRowSelected = computed(() => {
    return Boolean(
      tableData.value?.length &&
        tableData.value.length === Object.keys(selectedRowMap.value).length,
    );
  });

  // 计算部分选中状态
  const isPartialSelected = computed(() => {
    return (
      Object.keys(selectedRowMap.value).length > 0 && !isAllRowSelected.value
    );
  });

  // 切换全选状态
  const onToggleAllRowSelect = () => {
    if (isAllRowSelected.value) {
      selectedRowMap.value = {};
    } else {
      tableData.value?.forEach(row => {
        const rowKey = getRowKey(row);
        selectedRowMap.value[rowKey] = true;
      });
    }
  };

  // 获取选中的行ID
  const selectedRowIds = computed(() => {
    return Object.keys(selectedRowMap.value);
  });

  // 获取选中的行数据
  const selectedRows = computed(() => {
    return (
      tableData.value?.filter(row =>
        selectedRowIds.value.includes(getRowKey(row)),
      ) || []
    );
  });

  // 清空选择
  const clearSelection = () => {
    selectedRowMap.value = {};
  };

  // 设置选中行
  const setSelectedRows = (rows: T[] | undefined) => {
    selectedRowMap.value = {};
    rows?.forEach(row => {
      const rowKey = getRowKey(row);
      selectedRowMap.value[rowKey] = true;
    });
  };

  // 初始化默认选中项
  if (options.defaultSelectedRowKeys) {
    watch(
      tableData,
      () => {
        const defaultRows = tableData.value?.filter(row =>
          options.defaultSelectedRowKeys?.includes(getRowKey(row)),
        );
        setSelectedRows(defaultRows);
      },
      { immediate: true },
    );
  }

  return {
    selectedRowIds,
    selectedRows,
    isAllRowSelected,
    isPartialSelected,
    onToggleRowSelect,
    onToggleAllRowSelect,
    isRowSelected,
    clearSelection,
    setSelectedRows,
  };
}
