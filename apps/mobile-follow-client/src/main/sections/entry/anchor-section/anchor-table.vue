<script setup lang="tsx">
import type {
  AnchorFrom87,
  BatchAddToAnchorFollowGroupRequest,
  CreateAnchorFollowGroupRequest,
  GetAnchorFrom87ListResponseData,
} from '@tk-crawler/biz-shared';
import type { Column, SortBy } from 'element-plus';
// import { confirmAfterSeconds } from '@tk-crawler/view-shared';
import { useQuery } from '@tanstack/vue-query';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  ClearMessage,
  RefreshButton,
  useTableMultiSelect,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElCheckbox,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTableV2,
  ElTag,
  TableV2SortOrder,
} from 'element-plus';
import {
  computed,
  h,
  onActivated,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from 'vue';
import {
  batchAddToAnchorFollowGroup,
  clearAnchorFrom87,
  createAnchorFollowGroup,
  deleteAnchorFrom87,
  getAnchorFrom87List,
} from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import AnchorFilter from './anchor-filter.vue';
import BatchAddToGroupDialog from './batch-add-to-group-dialog/index.vue';
import CreateGroupDialog from './create-group-dialog.vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';

defineOptions({
  name: 'AnchorTable',
});

const globalStore = useGlobalStore();

const tableRef = shallowRef<InstanceType<typeof ElTableV2>>();
const pageNum = ref(1);
const pageSize = ref(1000);
const sortState = ref<
  | {
      key: string;
      order: TableV2SortOrder;
    }
  | undefined
>();

// 过滤条件
const filters = ref<FilterViewValues>(DefaultFilterViewValues);

// 处理过滤器变化
function handleFilterChange(_filters: FilterViewValues) {
  filters.value = _filters;
  pageNum.value = 1; // 重置页码
}

function handleFilterReset() {
  filters.value = DefaultFilterViewValues;
  pageNum.value = 1; // 重置页码
}

const orderBy = computed(() =>
  sortState.value?.key && sortState.value.order
    ? { [sortState.value.key]: sortState.value.order! }
    : undefined,
);
const filter = computed(() =>
  transformFilterViewValuesToFilterValues(filters.value),
);

const { data, isLoading, isError, error, refetch } = useQuery<
  GetAnchorFrom87ListResponseData | undefined
>({
  queryKey: [
    'anchors-from-87',
    globalStore.orgId,
    pageNum,
    pageSize,
    orderBy,
    filter,
  ],
  retry: false,
  queryFn: async () => {
    const response = await getAnchorFrom87List({
      page_num: pageNum.value,
      page_size: pageSize.value,
      order_by: orderBy.value,
      org_id: globalStore.orgId,
      filter: filter.value,
    });
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
  },
  placeholderData: previousData => previousData,
});

const anchorList = computed(() => data.value?.list || []);

const {
  selectedRows,
  isAllRowSelected,
  isPartialSelected,
  onToggleRowSelect,
  onToggleAllRowSelect,
  isRowSelected,
} = useTableMultiSelect(anchorList, {
  rowKey: 'id',
});

// TODO element-plus 排序有bug，自定义排序顺序
function handleSortChange(sort: SortBy) {
  if (sort.key !== sortState.value?.key) {
    sortState.value = {
      key: sort.key as string,
      order: TableV2SortOrder.ASC,
    };
  } else {
    if (sortState.value?.order === TableV2SortOrder.ASC) {
      sortState.value.order = TableV2SortOrder.DESC;
    } else if (sortState.value?.order === TableV2SortOrder.DESC) {
      sortState.value = undefined;
    }
  }
}

function resetSort() {
  sortState.value = undefined;
}

// 刷新功能
const isRefreshing = ref(false);
async function refresh() {
  isRefreshing.value = true;
  return refetch().finally(() => {
    isRefreshing.value = false;
  });
}

// 删除主播
async function deleteItem(item: AnchorFrom87) {
  try {
    await ElMessageBox.confirm(`确定要删除主播「${item.account}」吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await deleteAnchorFrom87({ id: [item.id], org_id: globalStore.orgId });
  ElMessage.success({
    message: `删除主播 ${item.account} 成功`,
    type: 'success',
    duration: 2000,
  });
  await refetch();
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

// 处理选择变化
function handleSelectionChange(rows: AnchorFrom87[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

const createGroupDialogVisible = ref(false);
function openCreateGroupDialog() {
  createGroupDialogVisible.value = true;
}
function closeCreateGroupDialog() {
  createGroupDialogVisible.value = false;
}
async function handleGroupCreateSubmit(
  data: Omit<CreateAnchorFollowGroupRequest, 'org_id'>,
) {
  const res = await createAnchorFollowGroup({
    name: data.name,
    anchor_table_ids: data.anchor_table_ids,
    org_id: globalStore.orgId,
  });
  if (res.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  ElMessage.success({
    message: '新增分组成功',
    type: 'success',
    duration: 2000,
  });
  closeCreateGroupDialog();
  await refetch();
}

const batchAddToGroupDialogVisible = ref(false);
function openBatchAddToGroupDialog() {
  batchAddToGroupDialogVisible.value = true;
}
function closeBatchAddToGroupDialog() {
  batchAddToGroupDialogVisible.value = false;
}
async function handleBatchAddToGroupSubmit(
  data: Omit<BatchAddToAnchorFollowGroupRequest, 'org_id'>,
) {
  const res = await batchAddToAnchorFollowGroup({
    group_id: data.group_id,
    anchor_table_ids: data.anchor_table_ids,
    org_id: globalStore.orgId,
  });
  if (res.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  ElMessage.success({
    message: '批量加入分组成功',
    type: 'success',
    duration: 2000,
  });
  closeBatchAddToGroupDialog();
  await refetch();
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${selectedRows.value.length} 个主播吗？`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  const { data, status_code } = await deleteAnchorFrom87({
    id: selectedRows.value.map(item => item.id),
    org_id: globalStore.orgId,
  });
  if (status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  ElMessage.success({
    message: `共删除 ${data?.deleted_count} 个主播`,
    type: 'success',
    duration: 2000,
  });
  await refetch();
}

async function handleClearData() {
  const state = reactive({
    clearType: 'filtered' as 'all' | 'filtered',
  });

  try {
    await ElMessageBox({
      title: '清空数据',
      message: h(ClearMessage, {
        value: state.clearType,
        filteredRowsTotal: data.value?.total || 0,
        onUpdate: val => {
          state.clearType = val as 'all' | 'filtered';
        },
      }),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    const resp = await clearAnchorFrom87({
      filter:
        state.clearType === 'all'
          ? undefined
          : transformFilterViewValuesToFilterValues(filters.value),
      org_id: globalStore.orgId,
    });
    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message: `共清空 ${resp.data?.deleted_count} 个主播`,
      type: 'success',
      duration: 2000,
    });

    await refetch();
  } catch {}
}

onActivated(refetch);

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

const columns = computed<Column<AnchorFrom87>[]>(() => [
  {
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
  },
  {
    key: 'account_id',
    dataKey: 'account_id',
    title: '账号ID',
    width: 180,
  },
  {
    key: 'account',
    dataKey: 'account',
    title: '账号',
    width: 140,
  },
  {
    key: 'has_grouped',
    dataKey: 'has_grouped',
    title: '是否已分组',
    width: 100,
    cellRenderer: ({ rowData }: { rowData: AnchorFrom87 }) => (
      <ElTag type={rowData.has_grouped ? 'success' : 'info'}>
        {rowData.has_grouped ? '已分组' : '未分组'}
      </ElTag>
    ),
  },
  {
    key: 'groups',
    dataKey: 'groups',
    title: '所属分组',
    width: 160,
    cellRenderer: ({ rowData }: { rowData: AnchorFrom87 }) => (
      <div class="group-container">
        {rowData.group ? (
          <div class="ellipsis-text">{rowData.group.name}</div>
        ) : (
          '-'
        )}
      </div>
    ),
  },
  {
    key: 'updated_at',
    dataKey: 'updated_at',
    title: '采集时间',
    width: 180,
    sortable: true,
    cellRenderer: ({ rowData }) => (
      <span>{rowData?.updated_at && formatDateTime(rowData.updated_at)}</span>
    ),
  },
  {
    key: 'canuse_invitation_type',
    dataKey: 'canuse_invitation_type',
    title: '邀约类型',
    width: 120,
    cellRenderer: ({ rowData }) => {
      if (rowData.canuse_invitation_type === 3) {
        return <ElTag type="info">常规邀约</ElTag>;
      }
      if (rowData.canuse_invitation_type === 4) {
        return <ElTag type="warning">金票邀约</ElTag>;
      }
      return <span />;
    },
  },
  {
    key: 'pieces',
    dataKey: 'pieces',
    title: '主播段位',
    width: 120,
    sortable: true,
  },
  {
    key: 'day_diamond_val',
    dataKey: 'day_diamond_val',
    title: '日钻石',
    width: 100,
    sortable: true,
  },
  {
    key: 'last_day_diamond_val',
    dataKey: 'last_day_diamond_val',
    title: '上次钻石',
    width: 120,
    sortable: true,
  },
  {
    key: 'his_max_diamond_val',
    dataKey: 'his_max_diamond_val',
    title: '历史最高钻石',
    width: 140,
    sortable: true,
  },
  {
    key: 'follower_count',
    dataKey: 'follower_count',
    title: '粉丝数',
    width: 100,
    sortable: true,
  },
  {
    key: 'country',
    dataKey: 'country',
    title: '地区名称',
    width: 80,
    cellRenderer: ({ rowData }) => <span>{rowData.country || '-'}</span>,
  },
  {
    key: 'country_code',
    dataKey: 'country_code',
    title: '地区编码',
    width: 80,
    cellRenderer: ({ rowData }) => <span>{rowData.country_code || '-'}</span>,
  },
  {
    key: 'available',
    dataKey: 'available',
    title: '可用状态',
    width: 100,
    cellRenderer: ({ rowData }) => {
      if (rowData.available === 0) {
        return <ElTag type="success">可用</ElTag>;
      }
      return <ElTag type="danger">不可用</ElTag>;
    },
  },
  {
    key: 'operations',
    title: '操作',
    width: 120,
    fixed: 'right' as any,
    cellRenderer: ({ rowData }) => (
      <div>
        <ElButton
          link
          type="danger"
          size="small"
          onClick={(e: Event) => {
            e.preventDefault();
            deleteItem(rowData);
          }}
        >
          删除
        </ElButton>
      </div>
    ),
  },
]);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="outer-container">
    <div v-if="isError" class="anchor-table-error">
      {{ error?.message || '加载失败' }}
    </div>
    <div v-show="!isError" class="anchor-table-main">
      <div class="filter-row">
        <AnchorFilter
          :model-value="filters"
          @change="handleFilterChange"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part">
          <ElButton
            :disabled="!hasSelectedRows"
            type="primary"
            size="small"
            @click="openBatchAddToGroupDialog"
          >
            批量加入分组
          </ElButton>
          <ElButton
            :disabled="!hasSelectedRows"
            type="primary"
            size="small"
            @click="openCreateGroupDialog"
          >
            创建新分组
          </ElButton>
        </div>
        <div class="right-part">
          <ElButton
            :disabled="!hasSelectedRows"
            type="danger"
            size="small"
            @click="handleBatchDelete"
          >
            批量删除
          </ElButton>
          <ElButton type="danger" size="small" @click="handleClearData">
            清空数据
          </ElButton>
          <ElButton type="default" size="small" @click="resetSort">
            重置排序
          </ElButton>
          <RefreshButton @click="refresh" />
        </div>
      </div>
      <div ref="tableContainer" class="table-container">
        <ElTableV2
          ref="tableRef"
          :cache="10"
          :data="anchorList"
          :width="containerWidth"
          :height="containerHeight"
          :columns="columns"
          :fixed="true"
          :row-height="43"
          row-key="id"
          :sort-by="sortState"
          @column-sort="handleSortChange"
          @selection-change="handleSelectionChange"
        />
      </div>
      <div class="pagination-row">
        <ElPagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          size="small"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[100, 200, 500, 1000]"
          :total="data?.total || 0"
          class="mt-4"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
      <CreateGroupDialog
        :visible="createGroupDialogVisible"
        :anchors="selectedRows"
        :submit="handleGroupCreateSubmit"
        @close="closeCreateGroupDialog"
      />
      <BatchAddToGroupDialog
        :visible="batchAddToGroupDialogVisible"
        :anchors="selectedRows"
        :submit="handleBatchAddToGroupSubmit"
        @close="closeBatchAddToGroupDialog"
      />
    </div>
  </div>
</template>

<style scoped>
.outer-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  flex: 1;
}

.anchor-table-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.table-container {
  flex: 1;
  width: 100%;
  min-height: 0; /* 重要：防止flex子元素溢出 */
}

.filter-row {
  width: 100%;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.header-row {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.left-part {
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
}

.right-part {
  display: flex;
  align-items: center;
  padding-right: 0.5rem;
}

.header-row-icon {
  cursor: pointer;
  font-size: 18px;
  margin-left: 0.5rem;
}

.header-row-icon:hover {
  color: var(--el-color-primary);
}

.anchor-table-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-danger);
}

.pagination-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-right: 1rem;
}
:deep(.group-container) {
  max-width: 100%;
  overflow: hidden;
}
:deep(.ellipsis-text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
