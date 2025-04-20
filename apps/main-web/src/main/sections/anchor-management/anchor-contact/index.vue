<script setup lang="tsx">
import type {
  DisplayedAnchorItem,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import { RefreshButton, useTableSort } from '@tk-crawler/view-shared';
import { ElButton, ElPagination, ElTable } from 'element-plus';
import { computed, onActivated, ref } from 'vue';
import { useGetAnchorList } from '../../../hooks';
import { useGlobalStore } from '../../../utils/vue';
import TKAnchorTableColumns from '../anchor-table/anchor-table-columns.vue';
import {
  type FilterViewValues,
  getCommonDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from '../anchor-table/filter';
import TKAnchorFilter from '../anchor-table/filter.vue';
import '../anchor-table/styles.scss';

defineOptions({
  name: 'TKAnchorContactTable',
});

const globalStore = useGlobalStore();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const { sortField, sortOrder, orderBy, handleSortChange, resetSort } =
  useTableSort<GetAnchorListOrderBy>({
    tableRef,
    pageNum,
  });

const defaultFilterViewValues = computed(() => {
  const commonDefaultFilterViewValues = getCommonDefaultFilterViewValues();
  return {
    ...commonDefaultFilterViewValues,
    area: globalStore.userProfile.orgInfo?.areas?.[0],
    assign_to: 'all',
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
  const filter = transformFilterViewValuesToFilterValues(filters.value);
  return {
    ...filter,
    assign_to: globalStore.userProfile.userInfo?.id,
  };
});

const { data, isLoading, isError, error, refetch } = useGetAnchorList(
  {
    pageNum,
    pageSize,
    filter: queryFilter,
    orderBy,
    includeTaskAssign: true,
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
// const hasSelectedRows = computed(() => selectedRows.value.length > 0);

onActivated(refetch);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="tk-anchor-user-table">
    <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <TKAnchorFilter
          :hidden-filters="['assign_to', 'checked_result']"
          :model-value="filters"
          :areas="globalStore.userProfile.orgInfo?.areas ?? []"
          @submit="handleFilterSubmit"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part"></div>
        <div class="right-part">
          <!-- <AdminBatchOperationButtons
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
          /> -->
          <ElButton type="default" size="small" @click="resetSort">
            重置排序
          </ElButton>
          <RefreshButton @click="refresh" />
        </div>
      </div>
      <ElTable
        ref="tableRef"
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
        <TKAnchorTableColumns />
        <!-- <AdminOperationColumn
          v-if="globalStore.userProfile.isAdmin"
          :refetch="refetch"
        />
        <MemberOperationColumn v-else :refetch="refetch" /> -->
      </ElTable>
      <div class="pagination-row">
        <ElPagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          size="small"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50, 100]"
          :total="data?.total || 0"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </template>
  </div>
</template>
