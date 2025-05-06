<script setup lang="tsx" generic="T extends Record<string, any>">
import type { VirtualizedTableColumn } from './types';
import { ElCheckbox, ElPagination } from 'element-plus';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { VxeColumn, VxeTable } from 'vxe-table';
import { useIsWebSize, useTableMultiSelect } from '../../hooks';

const props = withDefaults(
  defineProps<{
    data: T[];
    columns: VirtualizedTableColumn<T>[];
    loading?: boolean;
    error?: string;
    rowKey?: string;
    showSelection?: boolean;
    selectionColumnConfig?: Partial<VirtualizedTableColumn<T>>;
    pageNum?: number;
    pageSize?: number;
    total?: number;
    pageSizes?: number[];
    sortState?: {
      field: string;
      order: 'asc' | 'desc' | null;
    };
    selectedRows?: T[];
  }>(),
  {
    loading: false,
    error: '',
    rowKey: 'id',
    showSelection: false,
    selectionColumnConfig: () => ({}),
    pageNum: 1,
    pageSize: 10,
    total: 0,
    pageSizes: () => [10, 20, 50, 100, 200, 500, 1000],
    sortState: () => ({
      field: '',
      order: null,
    }),
    selectedRows: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:pageNum', value: number): void;
  (e: 'update:pageSize', value: number): void;
  (
    e: 'update:sortState',
    value: { field: string; order: 'asc' | 'desc' } | undefined,
  ): void;
  (e: 'update:selectedRows', rows: T[]): void;
  (e: 'selectionChange', rows: T[]): void;
}>();

const isWebSize = useIsWebSize();

const tableData = shallowRef<T[]>(props.data);

// 使用useTableMultiSelect hook
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

// 创建selection column
const selectionColumn = computed<VirtualizedTableColumn<T>>(() => ({
  key: 'selection',
  width: props.selectionColumnConfig?.width ?? 55,
  fixed: 'left',
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
  ...props.selectionColumnConfig,
}));

// 计算最终的columns
const computedColumns = computed(() => {
  if (!props.showSelection) {
    return props.columns;
  }
  return [selectionColumn.value, ...props.columns];
});

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

function handleSortChange(params: { property: string; order: string | null }) {
  if (!params.order) {
    emit('update:sortState', undefined);
  } else {
    emit('update:sortState', {
      field: params.property,
      order: params.order as 'asc' | 'desc',
    });
  }
}

onMounted(async () => {
  await import('vxe-table/lib/style.css');
});
</script>

<template>
  <div v-loading="loading" class="virtualized-table">
    <div v-if="error" class="table-error">
      {{ error }}
    </div>
    <div v-show="!error" class="table-main">
      <div ref="tableContainer" class="table-container">
        <VxeTable
          v-bind="$attrs"
          :data="tableData"
          :height="containerHeight"
          :row-config="{ useKey: true, keyField: rowKey }"
          :virtual-x-config="{ enabled: true, gt: 0 }"
          :virtual-y-config="{ enabled: true, gt: 0, oSize: 50, preSize: 20 }"
          :scrollbar-config="
            isWebSize
              ? {
                  width: 8,
                  height: 8,
                }
              : {
                  width: 6,
                  height: 6,
                }
          "
          :sort-config="{
            multiple: false,
            defaultSort: sortState,
            trigger: 'cell',
            allowBtn: false,
          }"
          :size="isWebSize ? 'medium' : 'mini'"
          @sort-change="handleSortChange"
        >
          <template v-for="col in computedColumns" :key="col.key">
            <VxeColumn
              :field="col.key"
              :title="col.title"
              :width="col.width"
              :sortable="col.sortable"
              :fixed="col.fixed"
            >
              <template #header>
                <template v-if="col.headerCellRenderer">
                  <component
                    :is="col.headerCellRenderer()"
                    :is-functional="true"
                  />
                </template>
                <template v-else>
                  {{ col.title }}
                </template>
              </template>
              <template #default="{ row }">
                <template v-if="col.cellRenderer">
                  <component
                    :is="col.cellRenderer({ rowData: row })"
                    :is-functional="true"
                  />
                </template>
                <template v-else>
                  {{ row[col.key as keyof T] }}
                </template>
              </template>
            </VxeColumn>
          </template>
        </VxeTable>
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
          :total="total ?? 0"
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
    .vxe-table {
      font-size: var(--el-font-size-extra-small);
    }
  }
  .table-main {
    .sortable-header {
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
      cursor: pointer;
    }
  }
  .vxe-table {
    --vxe-ui-font-primary-color: var(--el-color-primary);
    th.is--sortable {
      cursor: pointer;
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
