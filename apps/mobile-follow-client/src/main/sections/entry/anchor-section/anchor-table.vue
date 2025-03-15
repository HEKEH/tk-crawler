<script setup lang="ts">
import type {
  AnchorFrom87,
  GetAnchorFrom87ListResponseData,
} from '@tk-crawler/biz-shared';
import { RefreshRight } from '@element-plus/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import { formatDateTime } from '@tk-crawler/shared';
// import { confirmAfterSeconds } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { computed, onActivated, ref } from 'vue';
import {
  clearAnchorFrom87,
  deleteAnchorFrom87,
  getAnchorFrom87List,
} from '../../../requests';
import AnchorFilter from './anchor-filter.vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';

defineOptions({
  name: 'AnchorTable',
});

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(1000);
const sortField = ref<keyof AnchorFrom87>();
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

const { data, isLoading, isError, error, refetch } = useQuery<
  GetAnchorFrom87ListResponseData | undefined
>({
  queryKey: ['anchors', pageNum, pageSize, sortField, sortOrder, filters],
  retry: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getAnchorFrom87List({
      page_num: pageNum.value,
      page_size: pageSize.value,
      order_by: orderBy,
      filter: transformFilterViewValuesToFilterValues(filters.value),
    });
    return response.data;
  },
  placeholderData: previousData => previousData,
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof AnchorFrom87;
  order: 'ascending' | 'descending' | null;
}) {
  sortField.value = order ? prop : undefined;
  sortOrder.value = order || undefined;
}

// 刷新功能
const isRefreshing = ref(false);
function resetSort() {
  tableRef.value?.clearSort();
  sortField.value = undefined;
  sortOrder.value = undefined;
}
async function refresh() {
  isRefreshing.value = true;
  resetSort();
  return refetch().finally(() => {
    isRefreshing.value = false;
  });
}

// 删除主播
async function deleteItem(item: AnchorFrom87) {
  try {
    await ElMessageBox.confirm(`确定要删除主播 ${item.account} 吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await deleteAnchorFrom87({ id: [item.id] });
  ElMessage.success({ message: '删除成功', type: 'success', duration: 2000 });
  await refetch();
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<AnchorFrom87[]>([]);

// 处理选择变化
function handleSelectionChange(rows: AnchorFrom87[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

function handleBatchAddToGroup() {
  console.log('handleBatchAddToGroup', selectedRows.value);
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
  await deleteAnchorFrom87({ id: selectedRows.value.map(item => item.id) });
  ElMessage.success({
    message: '批量删除成功',
    type: 'success',
    duration: 2000,
  });
  await refetch();
}

async function handleClearData() {
  try {
    await ElMessageBox.confirm(`确定要清空主播数据吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await clearAnchorFrom87({});
  ElMessage.success({
    message: '清空成功',
    type: 'success',
    duration: 2000,
  });
  await refetch();
}

onActivated(refetch);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="anchor-table">
    <div v-if="isError" class="anchor-table-error">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
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
            @click="handleBatchAddToGroup"
          >
            批量加入分组
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
          <ElIcon class="header-row-icon" @click="refresh">
            <RefreshRight />
          </ElIcon>
        </div>
      </div>
      <ElTable
        ref="tableRef"
        :data="data?.list"
        style="width: 100%"
        height="calc(100% - 130px)"
        :default-sort="
          sortField && sortOrder
            ? { prop: sortField, order: sortOrder }
            : undefined
        "
        row-key="id"
        @sort-change="handleSortChange"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn prop="account_id" label="账号ID" min-width="180" />
        <ElTableColumn prop="account" label="账号" min-width="140" />

        <ElTableColumn prop="has_grouped" label="是否已分组" min-width="100">
          <template #default="scope">
            <ElTag :type="scope.row.has_grouped ? 'success' : 'info'">
              {{ scope.row.has_grouped ? '已分组' : '未分组' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="canuse_invitation_type"
          label="邀约类型"
          min-width="120"
        >
          <template #default="scope">
            <ElTag v-if="scope.row.canuse_invitation_type === 3" type="info">
              常规邀约
            </ElTag>
            <ElTag v-if="scope.row.canuse_invitation_type === 4" type="warning">
              金票邀约
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="day_diamond_val"
          label="日钻石"
          min-width="100"
          sortable="custom"
        />
        <ElTableColumn
          prop="last_day_diamond_val"
          label="上次钻石"
          min-width="120"
          sortable="custom"
        />
        <ElTableColumn
          prop="his_max_diamond_val"
          label="历史最高钻石"
          min-width="140"
          sortable="custom"
        />
        <ElTableColumn
          prop="follower_count"
          label="粉丝数"
          min-width="100"
          sortable="custom"
        />

        <ElTableColumn prop="country" label="地区名称" min-width="80">
          <template #default="scope">
            {{ scope.row.country || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="country" label="地区编码" min-width="80">
          <template #default="scope">
            {{ scope.row.country_code || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="available" label="可用状态" min-width="100">
          <template #default="scope">
            <ElTag :type="scope.row.available === 0 ? 'success' : 'danger'">
              {{ scope.row.available === 0 ? '可用' : '不可用' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- <ElTableColumn
          prop="created_at"
          label="创建时间"
          min-width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </ElTableColumn> -->

        <ElTableColumn
          prop="updated_at"
          label="采集时间"
          min-width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </ElTableColumn>

        <ElTableColumn fixed="right" label="操作" min-width="120">
          <template #default="scope">
            <div>
              <!-- <ElButton
                link
                type="primary"
                size="small"
                :disabled="scope.row.has_grouped"
              >
                加入分组
              </ElButton> -->
              <ElButton
                link
                type="danger"
                size="small"
                @click.prevent="deleteItem(scope.row)"
              >
                删除
              </ElButton>
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
          :page-sizes="[100, 200, 500, 1000]"
          :total="data?.total"
          class="mt-4"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.anchor-table {
  position: relative;
  flex: 1;
  height: 100%;
  width: 100%;
  overflow: hidden;
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
</style>
