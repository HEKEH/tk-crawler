<script setup lang="tsx">
import type {
  DisplayedAnchorItem,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import type { TableV2SortOrder } from 'element-plus';
import type { CustomColumnConfig } from './anchor-table-columns';
import {
  onKeepAliveActivated,
  RefreshButton,
  useIsWebSize,
  VirtualizedTable,
} from '@tk-crawler/view-shared';
import { ElButton } from 'element-plus';
import { computed, ref } from 'vue';
import config from '../../../config';
import { useGetAnchorList } from '../../../hooks';
import { useGlobalStore } from '../../../utils/vue';
import useAnchorTableColumns from './anchor-table-columns';
import ExportButton from './export-button/index.vue';
import {
  type FilterViewValues,
  getCommonDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TKAnchorFilter from './filter.vue';
import {
  AdminBatchOperationButtons,
  MemberBatchOperationButtons,
  useOperationColumn,
} from './operation';
import './styles.scss';

defineOptions({
  name: 'TKAnchorTable',
});

const isWeb = useIsWebSize();

const globalStore = useGlobalStore();

const pageNum = ref(1);
const pageSize = ref(20);
const sortState = ref<
  | {
      key: string;
      order: TableV2SortOrder;
    }
  | undefined
>();

function handleSortChange(
  sort:
    | {
        key: string;
        order: TableV2SortOrder;
      }
    | undefined,
) {
  sortState.value = sort;
  pageNum.value = 1;
}
function resetSort() {
  sortState.value = undefined;
}

const orderBy = computed<GetAnchorListOrderBy | undefined>(() =>
  sortState.value?.key && sortState.value.order
    ? ({
        [sortState.value.key]: sortState.value.order!,
      } as GetAnchorListOrderBy)
    : undefined,
);

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

const selectedRows = ref<DisplayedAnchorItem[]>([]);

const operationColumnResult = useOperationColumn({
  refetch,
});
const customColumns = computed<CustomColumnConfig[]>(() => {
  return [
    {
      ...operationColumnResult.value.column.value,
      customPosition: { after: 'display_id' },
    },
  ];
});

const operationColumnDialog = computed(() => operationColumnResult.value.view);

const columns = useAnchorTableColumns({
  customColumns,
});

const selectionColumnConfig = {
  width: 30,
  fixed: 'left' as any,
};

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
    <VirtualizedTable
      v-model:page-num="pageNum"
      v-model:page-size="pageSize"
      v-model:selected-rows="selectedRows"
      :data="data?.list ?? []"
      :columns="columns"
      :loading="isLoading || isRefreshing"
      :total="data?.total"
      :sort-state="sortState"
      :show-selection="true"
      :selection-column-config="selectionColumnConfig"
      row-key="id"
      @update:sort-state="handleSortChange"
    />
  </div>
  <component :is="operationColumnDialog" v-if="operationColumnDialog" />
</template>
