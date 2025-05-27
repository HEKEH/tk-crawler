<script setup lang="tsx">
import type {
  Area,
  GetAllTKGuildUserListResponseData,
  TKGuildUser,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { useQuery } from '@tanstack/vue-query';
import { AREA_NAME_MAP } from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  AreaTooltipIcon,
  CopyIcon,
  onKeepAliveActivated,
  RefreshButton,
  useIsWebSize,
  VisiblePassword,
} from '@tk-crawler/view-shared';
import { ElButton, ElPagination, ElTable, ElTableColumn } from 'element-plus';
import { computed, ref } from 'vue';
import { getAllTKGuildUserList } from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TKGuildUserFilter from './guild-user-filter.vue';
import StartStopButtonColumn from './start-stop-button-column.vue';
import StatusTag from './status-tag.vue';

defineOptions({
  name: 'TKGuildUserTable',
});

type TKGuildUserRow = GetAllTKGuildUserListResponseData['list'][number];

interface ScopeType {
  row: TKGuildUserRow;
  column: TableColumnCtx<TKGuildUserRow>;
  $index: number;
}

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);
const isWeb = useIsWebSize();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const sortField = ref<keyof TKGuildUser>();
const sortOrder = ref<'ascending' | 'descending'>();

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

const { data, isFetching, refetch } = useQuery<
  GetAllTKGuildUserListResponseData | undefined
>({
  queryKey: [
    'tk-guild-users',
    token,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
    filters,
  ],
  retry: false,
  // refetchOnWindowFocus: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getAllTKGuildUserList(
      {
        page_num: pageNum.value,
        page_size: pageSize.value,
        order_by: orderBy,
        filter: transformFilterViewValuesToFilterValues(filters.value),
      },
      token.value,
    );
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
    // return {
    //   list: new Array(pageSize.value).fill(0).map((_, index) => ({
    //     ...response.data?.list![0],
    //     username: `用户${index}`,
    //     id: index.toString(),
    //   })),
    //   total: 200,
    // };
  },
  placeholderData: previousData => previousData,
});

function refresh() {
  refetch();
  globalStore.guildAccountsManage.checkIsAnyAccountError();
}

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof TKGuildUser;
  order: 'ascending' | 'descending' | null;
}) {
  sortField.value = order ? prop : undefined;
  sortOrder.value = order || undefined;
}

function resetSort() {
  tableRef.value?.clearSort();
  sortField.value = undefined;
  sortOrder.value = undefined;
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<TKGuildUser[]>([]);

// 处理选择变化
function handleSelectionChange(rows: TKGuildUser[]) {
  selectedRows.value = rows;
}

function onFinishOperation() {
  refresh();
}

onKeepAliveActivated(refresh);
</script>

<template>
  <div v-loading="isFetching" class="tk-guild-user-table">
    <!-- <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div> -->
    <div class="filter-row">
      <TKGuildUserFilter
        :model-value="filters"
        @change="handleFilterChange"
        @reset="handleFilterReset"
      />
    </div>
    <div class="header-row">
      <div class="left-part"></div>
      <div class="right-part">
        <ElButton type="default" size="small" @click="resetSort">
          重置排序
        </ElButton>
        <RefreshButton @click="refresh" />
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
      <ElTableColumn type="selection" width="30" />
      <ElTableColumn
        prop="username"
        label="后台查询账号"
        sortable="custom"
        fixed="left"
        :min-width="isWeb ? 200 : 140"
      />
      <StartStopButtonColumn @finish-operation="onFinishOperation" />
      <ElTableColumn
        prop="status"
        label="状态"
        min-width="128"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          <StatusTag :status="scope.row.status" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="password"
        label="后台查询密码"
        :min-width="isWeb ? 140 : 100"
      >
        <template #default="scope: ScopeType">
          <VisiblePassword :password="scope.row.password" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="org_id"
        label="机构ID"
        sortable="custom"
        :min-width="isWeb ? 100 : 80"
      />
      <ElTableColumn
        prop="org_name"
        label="机构名称"
        :min-width="isWeb ? 140 : 100"
      />
      <ElTableColumn
        prop="area"
        label="分区"
        sortable="custom"
        :min-width="isWeb ? 140 : 100"
      >
        <template #default="scope: ScopeType">
          <div class="area-with-tooltip">
            {{ AREA_NAME_MAP[scope.row.area as Area] || '-' }}
            <AreaTooltipIcon :area="scope.row.area as Area" />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="started_at"
        label="启动查询时间"
        :min-width="isWeb ? 205 : 170"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{
            scope.row.started_at ? formatDateTime(scope.row.started_at) : '-'
          }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="started_by"
        label="启动操作者"
        :min-width="isWeb ? 205 : 170"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ scope.row.started_by || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="error_at"
        label="上次账号过期时间"
        :min-width="isWeb ? 205 : 170"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ scope.row.error_at ? formatDateTime(scope.row.error_at) : '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="max_query_per_day"
        label="每天最大查询次数"
        :min-width="isWeb ? 160 : 140"
        sortable="custom"
      />
      <ElTableColumn
        prop="max_query_per_hour"
        label="每小时最大查询次数"
        :min-width="isWeb ? 180 : 150"
        sortable="custom"
      />
      <ElTableColumn
        prop="created_at"
        label="创建时间"
        :min-width="isWeb ? 205 : 170"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.created_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="updated_at"
        label="更新时间"
        :min-width="isWeb ? 205 : 170"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.updated_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="cookie" label="Cookie" min-width="200">
        <template #default="scope: ScopeType">
          <div v-if="scope.row.cookie" class="cookie">
            <span class="cookie-text">{{ scope.row.cookie }}</span>
            <CopyIcon tooltip="复制Cookie" :copy-content="scope.row.cookie" />
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
    <div class="pagination-row">
      <ElPagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        size="small"
        background
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50, 100]"
        :pager-count="isWeb ? 7 : 3"
        :total="data?.total || 0"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNumChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tk-guild-user-table {
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  @include mobile {
    padding: 1rem;
  }
  @include web {
    padding: 2rem 1rem;
  }
  .filter-row {
    width: 100%;
    overflow: hidden;
    @include mobile {
      margin-bottom: 0.5rem;
    }
    @include web {
      margin-bottom: 1rem;
    }
  }
  .header-row {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    .left-part {
      display: flex;
      align-items: center;
      @include mobile {
        padding-left: 0.5rem;
      }
    }
    .right-part {
      display: flex;
      align-items: center;
      padding-right: 0.5rem;
    }
  }
  .header-row-icon {
    cursor: pointer;
    font-size: 18px;
    margin-left: 0.5rem;
    &:hover {
      color: var(--el-color-primary);
    }
  }
  .error-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-danger);
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
  .main-table {
    flex: 1;
    width: 100%;
  }
  .cookie {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    column-gap: 0.25rem;
    .cookie-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .area-with-tooltip {
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
  .start-or-stop-button {
    width: 100%;
  }
}
</style>
