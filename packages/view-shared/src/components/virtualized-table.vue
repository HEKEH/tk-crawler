<script setup lang="tsx" generic="T extends Record<string, any>">
import type { Column, SortBy } from 'element-plus';
import { useIsWebSize, useTableMultiSelect } from '../hooks';
import {
  ElCheckbox,
  ElPagination,
  ElTableV2,
  TableV2SortOrder,
} from 'element-plus';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

export interface Props<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  total?: number;
  pageNum: number;
  pageSize: number;
  pageSizes?: number[];
  showSelection?: boolean;
  rowKey?: string;
  selectedRows?: T[];
  pagerSize?: number;
  sortState?: { key: string; order: TableV2SortOrder } | undefined;
}

const isWebSize = useIsWebSize();

const props = withDefaults(defineProps<Props<T>>(), {
  showSelection: true,
  rowKey: 'id',
  pageSizes: () => [10, 20, 50, 100, 200, 500, 1000],
});

const emit = defineEmits<{
  (e: 'update:pageNum', value: number): void;
  (e: 'update:pageSize', value: number): void;
  (
    e: 'update:sortState',
    value: { key: string; order: TableV2SortOrder } | undefined,
  ): void;
  (e: 'update:selectedRows', rows: T[]): void;
  (e: 'selectionChange', rows: T[]): void;
}>();

const tableData = shallowRef<T[]>(props.data);

const {
  selectedRows,
  isAllRowSelected,
  isPartialSelected,
  onToggleRowSelect,
  onToggleAllRowSelect,
  isRowSelected,
} = useTableMultiSelect<T>(tableData, {
  rowKey: props.rowKey,
});

// 监听data变化
watch(
  () => props.data,
  newVal => {
    tableData.value = newVal;
  },
  { immediate: true },
);

// 监听selectedRows变化
watch(
  () => props.selectedRows,
  newVal => {
    if (newVal) {
      selectedRows.value = newVal;
    }
  },
  { immediate: true },
);

// 监听selectedRows变化并触发事件
watch(selectedRows, newVal => {
  emit('update:selectedRows', newVal);
  emit('selectionChange', newVal);
});

const tableRef = shallowRef<InstanceType<typeof ElTableV2>>();
const containerWidth = ref(800);
const containerHeight = ref(600);
const tableContainer = ref<HTMLElement>();

function updateSize() {
  if (tableContainer.value) {
    containerWidth.value = tableContainer.value.offsetWidth;
    containerHeight.value = Math.max(tableContainer.value.offsetHeight, 100);
  }
}

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  if (tableContainer.value) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(tableContainer.value);
  }
  updateSize();
});

onBeforeUnmount(() => {
  if (!resizeObserver) {
    return;
  }
  if (tableContainer.value) {
    resizeObserver.unobserve(tableContainer.value);
  }
  resizeObserver.disconnect();
  resizeObserver = null;
});

function handlePageNumChange(_pageNum: number) {
  emit('update:pageNum', _pageNum);
}

function handlePageSizeChange(_pageSize: number) {
  emit('update:pageSize', _pageSize);
}

/**
 * TODO element-plus 排序有bug，自定义排序顺序
 */
function handleSortChange(sort: SortBy) {
  if (sort.key !== props.sortState?.key) {
    emit('update:sortState', {
      key: sort.key as string,
      order: TableV2SortOrder.ASC,
    });
  } else {
    if (props.sortState?.order === TableV2SortOrder.ASC) {
      emit('update:sortState', {
        key: sort.key as string,
        order: TableV2SortOrder.DESC,
      });
    } else if (props.sortState?.order === TableV2SortOrder.DESC) {
      emit('update:sortState', undefined);
    }
  }
}

const selectionColumn: Column<T> = {
  key: 'selection',
  width: 55,
  cellRenderer: ({ rowData }) => {
    const onChange = () => onToggleRowSelect(rowData);
    return (
      <ElCheckbox modelValue={isRowSelected(rowData)} onChange={onChange} />
    );
  },
  headerCellRenderer: () => {
    const allSelected = isAllRowSelected.value;
    return (
      <ElCheckbox
        modelValue={allSelected}
        indeterminate={isPartialSelected.value}
        onChange={onToggleAllRowSelect}
      />
    );
  },
};

const computedColumns = computed(() => {
  if (!props.showSelection) {
    return props.columns;
  }
  return [selectionColumn, ...props.columns];
});
</script>

<template>
  <div v-loading="loading" class="virtualized-table">
    <div v-if="error" class="table-error">
      {{ error }}
    </div>
    <div v-show="!error" class="table-main">
      <div ref="tableContainer" class="table-container">
        <ElTableV2
          v-bind="$attrs"
          ref="tableRef"
          :size="isWebSize ? 'default' : 'small'"
          :cache="10"
          :data="tableData"
          :width="containerWidth"
          :height="containerHeight"
          :columns="computedColumns"
          :fixed="true"
          :row-height="43"
          :row-key="rowKey"
          :sort-by="sortState"
          @column-sort="handleSortChange"
        />
      </div>
      <div class="pagination-row">
        <ElPagination
          :current-page="pageNum"
          :page-size="pageSize"
          size="small"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="pageSizes"
          :pager-count="isWebSize ? 7 : 3"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.virtualized-table {
  @include mobile {
    .el-table-v2__table {
      font-size: var(--el-font-size-extra-small);
    }
  }
}
</style>
<style lang="scss" scoped>
.virtualized-table {
  position: relative;
  width: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 200px;
}

.table-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.table-container {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.table-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-danger);
  padding: 1rem;
  text-align: center;
  min-height: 200px;
}

.pagination-row {
  width: 100%;
  display: flex;
  margin-top: 1rem;
  padding-right: 1rem;
  @include mobile {
    justify-content: center;
  }
  @include web {
    justify-content: flex-end;
  }
}
</style>
