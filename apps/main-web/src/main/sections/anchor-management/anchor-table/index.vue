<script setup lang="tsx">
import type {
  DisplayedAnchorItem,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import type { CustomColumnConfig } from './anchor-table-columns';
import {
  onKeepAliveActivated,
  RefreshButton,
  useIsWebSize,
  useTableSort,
} from '@tk-crawler/view-shared';
import { ElButton, ElPagination, ElTable } from 'element-plus';
import { computed, ref } from 'vue';
import config from '../../../config';
import { useGetAnchorList } from '../../../hooks';
import { useGlobalStore } from '../../../utils/vue';
import TKAnchorTableColumns from './anchor-table-columns';
import ExportButton from './export-button/index.vue';
import {
  type FilterViewValues,
  getCommonDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TKAnchorFilter from './filter.vue';
import {
  AdminBatchOperationButtons,
  AdminOperationColumn,
  MemberBatchOperationButtons,
  MemberOperationColumn,
} from './operation';
import './styles.scss';

defineOptions({
  name: 'TKAnchorTable',
});

const isWeb = useIsWebSize();

const globalStore = useGlobalStore();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const { sortField, sortOrder, orderBy, handleSortChange, resetSort } =
  useTableSort<GetAnchorListOrderBy>({
    tableRef,
    pageNum,
  });

const defaultFilterViewValues = computed<FilterViewValues>(() => {
  const commonDefaultFilterViewValues = getCommonDefaultFilterViewValues();
  return {
    ...commonDefaultFilterViewValues,
    area: globalStore.userProfile.orgInfo?.areas?.[0],
    assign_to: 'all',
    contacted_by: 'not_contacted',
  };
});

// 过滤条件
const filters = ref<FilterViewValues>(defaultFilterViewValues.value);

// 处理过滤器变化
function handleFilterSubmit(_filters: FilterViewValues) {
  filters.value = _filters;
  pageNum.value = 1; // 重置页码
}

function handleFilterReset() {
  filters.value = defaultFilterViewValues.value;
  pageNum.value = 1; // 重置页码
}

const queryFilter = computed(() => {
  return transformFilterViewValuesToFilterValues(filters.value);
});

const { data, isLoading, refetch } = useGetAnchorList(
  {
    pageNum,
    pageSize,
    filter: queryFilter,
    orderBy,
    includeTaskAssign: true,
    includeAnchorContact: true,
  },
  globalStore.token,
);

// 刷新功能
const isRefreshing = ref(false);
async function refresh() {
  isRefreshing.value = true;
  return refetch().finally(() => {
    isRefreshing.value = false;
  });
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<DisplayedAnchorItem[]>([]);

// 处理选择变化
function handleSelectionChange(rows: DisplayedAnchorItem[]) {
  selectedRows.value = rows;
}

const operationColumn = computed<CustomColumnConfig>(() => {
  const isAdmin = globalStore.userProfile.isAdmin;
  if (isAdmin) {
    return {
      key: 'admin-operation',
      after: 'display_id',
      renderColumn: () => {
        return (
          <AdminOperationColumn
            key="admin-operation"
            refetch={refetch}
            {...{
              fixed: isWeb.value ? 'left' : undefined,
            }}
          />
        );
      },
    };
  }
  return {
    key: 'member-operation',
    after: isWeb.value ? undefined : 'display_id',
    renderColumn: () => {
      return (
        <MemberOperationColumn
          key="member-operation"
          refetch={refetch}
          {...{
            fixed: isWeb.value ? 'right' : undefined,
          }}
        />
      );
    },
  };
});

const customColumns = computed<CustomColumnConfig[]>(() => {
  return [operationColumn.value];
});
// const hasSelectedRows = computed(() => selectedRows.value.length > 0);

onKeepAliveActivated(refetch);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="tk-anchor-user-table">
    <!-- <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div> -->
    <div class="filter-row">
      <TKAnchorFilter
        :model-value="filters"
        :hidden-filters="['contacted_by_simple']"
        :areas="globalStore.userProfile.orgInfo?.areas ?? []"
        @submit="handleFilterSubmit"
        @reset="handleFilterReset"
      />
    </div>
    <div class="header-row">
      <div class="left-part"></div>
      <div class="right-part">
        <AdminBatchOperationButtons
          v-if="globalStore.userProfile.isAdmin"
          :query-filter="queryFilter"
          :refetch="refetch"
          :data="data"
          :selected-rows="selectedRows"
        />
        <MemberBatchOperationButtons
          v-else
          :refetch="refetch"
          :selected-rows="selectedRows"
        />
        <ElButton v-if="isWeb" type="default" size="small" @click="resetSort">
          重置排序
        </ElButton>
        <RefreshButton v-if="isWeb" @click="refresh" />
        <ExportButton
          v-if="config.enableDataDownload"
          :query-filter="queryFilter"
          filename="主播列表"
        />
      </div>
    </div>
    <ElTable
      ref="tableRef"
      :size="isWeb ? 'default' : 'small'"
      :data="data?.list"
      class="main-table"
      :default-sort="
        sortField && sortOrder
          ? { prop: sortField, order: sortOrder }
          : undefined
      "
      row-key="id"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <TKAnchorTableColumns :custom-columns="customColumns" />
    </ElTable>
    <div class="pagination-row">
      <ElPagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        class="pagination"
        size="small"
        background
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
        :pager-count="isWeb ? 7 : 3"
        :total="data?.total || 0"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNumChange"
      />
    </div>
  </div>
</template>

<style scoped>
.pagination {
  --el-pagination-item-gap: 8px;
}
</style>
