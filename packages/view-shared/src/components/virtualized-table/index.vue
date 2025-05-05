<script setup lang="tsx" generic="T extends Record<string, any>">
import type { VxeTableInstance } from 'vxe-table';
import type { VirtualizedTableColumn } from './types';
import { ElPagination } from 'element-plus';
import {
  markRaw,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { VxeColumn, VxeTable } from 'vxe-table';
import { useIsWebSize } from '../../hooks';

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
const selectedRows = ref<T[]>([]);

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
      selectedRows.value = newVal as T[];
    }
  },
  { immediate: true },
);

// 监听selectedRows变化并触发事件
watch(selectedRows, newVal => {
  emit('update:selectedRows', newVal as T[]);
  emit('selectionChange', newVal as T[]);
});

const tableRef = shallowRef<VxeTableInstance>();
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

interface CheckboxEventParams {
  records: any[];
  checked: boolean;
}

function handleCheckboxChange(params: CheckboxEventParams) {
  selectedRows.value = params.records as T[];
}
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
          ref="tableRef"
          :data="tableData"
          :height="containerHeight"
          :row-config="{ keyField: rowKey }"
          :column-config="{ resizable: true }"
          :scroll-x="{ enabled: true }"
          :scroll-y="{ enabled: true }"
          :sort-config="{ multiple: false, defaultSort: sortState }"
          :checkbox-config="{
            checkField: 'checked',
            checkRowKeys: selectedRows?.map(row => row[rowKey]),
          }"
          :size="isWebSize ? 'medium' : 'small'"
          @sort-change="handleSortChange"
          @checkbox-change="handleCheckboxChange"
          @checkbox-all="handleCheckboxChange"
        >
          <template v-if="showSelection">
            <VxeColumn
              type="checkbox"
              :width="selectionColumnConfig?.width ?? 55"
              fixed="left"
            />
          </template>
          <template v-for="col in props.columns" :key="col.key">
            <VxeColumn
              :field="col.key"
              :title="col.title"
              :width="col.width"
              :sortable="col.sortable"
              :fixed="col.fixed"
            >
              <template #default="{ row }">
                <template v-if="col.CellComponent">
                  <component :is="markRaw(col.CellComponent)" :row-data="row" />
                </template>
                <!-- <template v-else-if="col.cellRenderer">
                  <component :is="col.cellRenderer({ rowData: row })" />
                </template> -->
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
@import 'vxe-table/lib/style.css';

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
