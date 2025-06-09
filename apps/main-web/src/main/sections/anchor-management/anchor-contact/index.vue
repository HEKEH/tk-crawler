<script setup lang="tsx">
import type {
  DisplayedAnchorItem,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import type { CustomColumnConfig } from '../anchor-table/anchor-table-columns';
import {
  ColumnSettingIcon,
  onKeepAliveActivated,
  RefreshButton,
  useIsWebSize,
  useVisibleColumnList,
  VirtualizedTable,
} from '@tk-crawler/view-shared';
import { ElButton } from 'element-plus';
import { isEqual } from 'lodash';
import { computed, ref } from 'vue';
import config from '../../../config';
import { useGetAnchorList } from '../../../hooks';
import { localStorageStore, useGlobalStore } from '../../../utils';
import useAnchorTableColumns from '../anchor-table/anchor-table-columns';
import ExportButton from '../anchor-table/export-button/index.vue';
import {
  type FilterViewValues,
  getCommonDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from '../anchor-table/filter';
import TKAnchorFilter from '../anchor-table/filter.vue';
import { useOpenDataExportFunction } from '../anchor-table/hooks';
import { BatchOperationButtons, useOperationColumn } from './operation';
import '../anchor-table/styles.scss';

defineOptions({
  name: 'TKAnchorContactTable',
});

const isWeb = useIsWebSize();

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);

const pageNum = ref(1);
const pageSize = ref(20);
const sortState = ref<
  | {
      field: string;
      order: 'asc' | 'desc';
    }
  | undefined
>();

function handleSortChange(
  sort:
    | {
        field: string;
        order: 'asc' | 'desc';
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
  sortState.value?.field && sortState.value.order
    ? ({
        [sortState.value.field]: sortState.value.order!,
      } as GetAnchorListOrderBy)
    : undefined,
);

const defaultFilterViewValues = computed<FilterViewValues>(() => {
  const commonDefaultFilterViewValues = getCommonDefaultFilterViewValues();
  return {
    ...commonDefaultFilterViewValues,
    area: globalStore.userProfile.orgInfo?.areas?.[0],
    contacted_by: 'not_contacted',
  };
});

// 过滤条件
const filters = ref<FilterViewValues>(defaultFilterViewValues.value);

const queryFilter = computed(() => {
  const filter = transformFilterViewValuesToFilterValues(filters.value);
  return {
    ...filter,
    assign_to: globalStore.userProfile.userId,
  };
});

const { data, isFetching, refetch } = useGetAnchorList(
  {
    pageNum,
    pageSize,
    filter: queryFilter,
    orderBy,
    includeTaskAssign: true,
    includeAnchorContact: true,
  },
  token,
);

// 处理过滤器变化
function handleFilterSubmit(_filters: FilterViewValues) {
  if (!isEqual(_filters, filters.value) || pageNum.value !== 1) {
    filters.value = _filters;
    pageNum.value = 1; // 重置页码
  } else {
    // 仍然触发刷新
    refetch();
  }
}

function handleFilterReset() {
  filters.value = defaultFilterViewValues.value;
  pageNum.value = 1; // 重置页码
}

// 刷新功能
async function refresh() {
  // isRefreshing.value = true;
  return refetch().finally(() => {
    // isRefreshing.value = false;
  });
}

const selectedRows = ref<DisplayedAnchorItem[]>([]);

const operationColumnResult = useOperationColumn({
  onDeleteAnchorContactRow: (anchor: DisplayedAnchorItem) => {
    selectedRows.value = selectedRows.value.filter(
      item => item.id !== anchor.id,
    );
    const index = data.value?.list.findIndex(item => item.id === anchor.id);
    if (index !== undefined && index !== -1) {
      data.value!.list.splice(index, 1);
    }
  },
});
const customColumns = computed<CustomColumnConfig[]>(() => {
  return [
    {
      ...operationColumnResult.column.value,
      customPosition: { after: 'display_id' },
    },
  ];
});

const columns = useAnchorTableColumns({
  customColumns,
});

const {
  columnsForVisibleSetting,
  visibleSettingColumnMap,
  visibleColumns,
  setVisibleColumnMap,
} = useVisibleColumnList({
  columns,
  localStoreKey: 'anchor-contact-table-columns-visible',
  localStorageStore,
});

const selectionColumnConfig = {
  width: 30,
  fixed: 'left' as any,
};

// const hasSelectedRows = computed(() => selectedRows.value.length > 0);
useOpenDataExportFunction();
onKeepAliveActivated(refetch);
</script>

<template>
  <div class="tk-anchor-user-table">
    <!-- <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div> -->
    <div class="filter-row">
      <TKAnchorFilter
        :hidden-filters="['assign_to', 'checked_result', 'contacted_by']"
        :model-value="filters"
        :areas="globalStore.userProfile.orgInfo?.areas ?? []"
        @submit="handleFilterSubmit"
        @reset="handleFilterReset"
      >
        <template v-if="!isWeb" #extra-buttons>
          <RefreshButton @click="refresh" />
        </template>
      </TKAnchorFilter>
    </div>
    <div class="header-row">
      <div class="left-part"></div>
      <div class="right-part">
        <BatchOperationButtons :selected-rows="selectedRows" />
        <ElButton v-if="isWeb" type="default" size="small" @click="resetSort">
          重置排序
        </ElButton>
        <RefreshButton v-if="isWeb" @click="refresh" />
        <ExportButton
          v-if="
            config.enableDataDownload
            // && localStorageStore.getItem(EXPORT_DATA_FUNCTION_IS_OPENED_KEY)
          "
          :query-filter="queryFilter"
          filename="主播建联"
        />
        <ColumnSettingIcon
          :columns="columnsForVisibleSetting"
          :columns-visible-map="visibleSettingColumnMap"
          class="ml-auto md:ml-3"
          @update:columns-visible-map="setVisibleColumnMap"
        />
      </div>
    </div>
    <VirtualizedTable
      v-model:page-num="pageNum"
      v-model:page-size="pageSize"
      v-model:selected-rows="selectedRows"
      :data="data?.list"
      :columns="visibleColumns"
      :loading="isFetching"
      :total="data?.total"
      :sort-state="sortState"
      :show-selection="true"
      :selection-column-config="selectionColumnConfig"
      row-key="id"
      @update:sort-state="handleSortChange"
    />
  </div>
</template>
