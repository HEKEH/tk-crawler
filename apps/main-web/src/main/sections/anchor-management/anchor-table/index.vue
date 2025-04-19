<script setup lang="tsx">
import type {
  DisplayedAnchorItem,
  GetAnchorListOrderBy,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import type { FilterViewValues } from './filter';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import {
  ClearMessage,
  confirmAfterSeconds,
  RefreshButton,
  useTableSort,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import { h, onActivated, reactive, ref } from 'vue';
import { useGetAnchorList } from '../../../hooks';
import { assignTask, clearAnchorCheck } from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import TKAnchorTableColumns from './anchor-table-columns.vue';
import AssignTaskFormDialog from './assign-task-form-dialog.vue';
import TKAnchorFilter from './filter.vue';
import { useAnchorTableAdapter, useDefaultFilterViewValues } from './hooks';

defineOptions({
  name: 'TKAnchorTable',
});

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

const globalStore = useGlobalStore();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const { sortField, sortOrder, orderBy, handleSortChange, resetSort } =
  useTableSort<GetAnchorListOrderBy>({
    tableRef,
    pageNum,
  });

const defaultFilterViewValues = useDefaultFilterViewValues();

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

const { queryFilter, hiddenFilters } = useAnchorTableAdapter({
  filters,
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

async function handleClearAnchorCheck() {
  const state = reactive({
    clearType: 'all' as 'all' | 'filtered',
  });

  try {
    await confirmAfterSeconds(
      h(ClearMessage, {
        value: state.clearType,
        filteredRowsTotal: data.value?.total || 0,
        onUpdate: val => {
          state.clearType = val as 'all' | 'filtered';
        },
      }),
      2,
      {
        title: '一键清空',
        type: undefined,
        showCancelButton: true,
      },
    );

    const resp = await clearAnchorCheck(globalStore.token, {
      filter: state.clearType === 'all' ? undefined : queryFilter.value,
    });

    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message: `共清空 ${resp.data!.deleted_count} 条数据`,
      type: 'success',
      duration: 2000,
    });

    await refetch();
  } catch {}
}

const assignTaskDialogVisible = ref(false);
const taskAnchors = ref<DisplayedAnchorItem[]>([]);

function openAssignTaskDialog(item: DisplayedAnchorItem[]) {
  taskAnchors.value = item;
  assignTaskDialogVisible.value = true;
}
function onCloseAssignTaskDialog() {
  assignTaskDialogVisible.value = false;
  taskAnchors.value = [];
}
async function handleSubmitTaskAssign(data: { orgMemberId: string }) {
  const result = await assignTask(
    {
      anchor_check_ids: taskAnchors.value.map(item => item.id),
      org_member_id: data.orgMemberId,
    },
    globalStore.token,
  );
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  onCloseAssignTaskDialog();
  ElMessage.success('主播分配成功');
}

async function handleCancelAssignTask(data: DisplayedAnchorItem) {
  try {
    await ElMessageBox.confirm(
      `确定取消将「${data.display_id}」分配给「${data.assigned_user!.display_name}」吗？`,
      {
        type: 'warning',
        showCancelButton: true,
      },
    );
  } catch {
    return;
  }
  const result = await assignTask(
    {
      anchor_check_ids: [data.id],
      org_member_id: null,
    },
    globalStore.token,
  );
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  ElMessage.success('主播取消分配成功');
}

async function batchCancelAssignTasks() {
  const anchorCheckIds = selectedRows.value
    .filter(item => item.assigned_user)
    .map(item => item.id);
  try {
    await ElMessageBox.confirm(
      `确定取消分配 ${anchorCheckIds.length} 个主播吗？`,
      {
        type: 'warning',
        showCancelButton: true,
      },
    );
  } catch {
    return;
  }
  const result = await assignTask(
    {
      anchor_check_ids: anchorCheckIds,
      org_member_id: null,
    },
    globalStore.token,
  );
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  ElMessage.success('主播批量取消分配成功');
}

// async function handleClaimTask(taskAnchors: DisplayedAnchorItem[]) {
//   const result = await claimTask(
//     {
//       anchor_check_ids: taskAnchors.map(item => item.id),
//     },
//     globalStore.token,
//   );
//   if (result.status_code !== RESPONSE_CODE.SUCCESS) {
//     return;
//   }
//   await refetch();
//   ElMessage.success('认领任务成功');
// }

// async function handleCancelClaimTask(taskAnchors: DisplayedAnchorItem[]) {
//   const result = await cancelClaimTask(
//     {
//       anchor_check_ids: taskAnchors.map(item => item.id),
//     },
//     globalStore.token,
//   );
//   if (result.status_code !== RESPONSE_CODE.SUCCESS) {
//     return;
//   }
//   await refetch();
//   ElMessage.success('取消任务成功');
// }

// async function handleBatchClaimTask() {
//   const taskAnchors = selectedRows.value.filter(item => !item.assigned_user);
//   try {
//     await ElMessageBox.confirm(
//       `确定认领 ${taskAnchors.length} 个未分配主播吗？`,
//       {
//         type: 'success',
//         showCancelButton: true,
//       },
//     );
//   } catch {
//     return;
//   }
//   await handleClaimTask(taskAnchors);
// }

// async function handleBatchCancelClaim() {
//   const taskAnchors = selectedRows.value.filter(
//     item => item.assigned_user?.id === globalStore.userProfile.userInfo?.id,
//   );
//   try {
//     await ElMessageBox.confirm(
//       `确定取消本人的 ${taskAnchors.length} 个任务吗？`,
//       {
//         type: 'warning',
//         showCancelButton: true,
//       },
//     );
//   } catch {
//     return;
//   }
//   await handleCancelClaimTask(taskAnchors);
// }

onActivated(refetch);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="tk-guild-user-table">
    <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <TKAnchorFilter
          :hidden-filters="hiddenFilters"
          :model-value="filters"
          :areas="globalStore.userProfile.orgInfo?.areas ?? []"
          @submit="handleFilterSubmit"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part"></div>
        <div class="right-part">
          <template v-if="globalStore.userProfile.isAdmin">
            <ElButton
              :disabled="
                !selectedRows.filter(item => item.checked_result).length
              "
              type="primary"
              size="small"
              @click="
                openAssignTaskDialog(
                  selectedRows.filter(item => item.checked_result),
                )
              "
            >
              批量分配
            </ElButton>
            <ElButton
              :disabled="
                !selectedRows.filter(item => item.assigned_user).length
              "
              type="danger"
              size="small"
              @click="batchCancelAssignTasks"
            >
              批量取消分配
            </ElButton>
            <ElButton
              type="danger"
              size="small"
              @click="handleClearAnchorCheck"
            >
              一键清空
            </ElButton>
          </template>
          <!-- <template v-else>
            <ElButton
              type="primary"
              size="small"
              :disabled="
                !selectedRows.filter(item => !item.assigned_user).length
              "
              @click="handleBatchClaimTask"
            >
              批量认领任务
            </ElButton>
            <ElButton
              :disabled="
                !selectedRows.filter(
                  item =>
                    item.assigned_user?.id ===
                    globalStore.userProfile.userInfo?.id,
                ).length
              "
              type="danger"
              size="small"
              @click="handleBatchCancelClaim"
            >
              批量取消任务
            </ElButton>
          </template> -->
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
        <ElTableColumn
          label="操作"
          :min-width="globalStore.userProfile.isAdmin ? 180 : 120"
          fixed="right"
        >
          <template #default="scope: ScopeType">
            <div class="operation-buttons">
              <template v-if="globalStore.userProfile.isAdmin">
                <ElButton
                  size="small"
                  type="primary"
                  :disabled="!scope.row.checked_result"
                  @click="openAssignTaskDialog([scope.row])"
                >
                  {{ scope.row.assigned_user ? '重新分配' : '分配主播' }}
                </ElButton>
                <ElButton
                  :disabled="!scope.row.assigned_user"
                  size="small"
                  type="danger"
                  @click="handleCancelAssignTask(scope.row)"
                >
                  取消分配
                </ElButton>
              </template>
              <!-- <template v-else>
                <ElButton
                  v-if="!scope.row.assigned_user"
                  size="small"
                  type="primary"
                  @click="handleClaimTask([scope.row])"
                >
                  认领任务
                </ElButton>
                <ElButton
                  v-else-if="
                    scope.row.assigned_user.id ===
                    globalStore.userProfile.userInfo?.id
                  "
                  size="small"
                  type="danger"
                  @click="handleCancelClaimTask([scope.row])"
                >
                  取消任务
                </ElButton>
              </template> -->
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
          :total="data?.total || 0"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
      <AssignTaskFormDialog
        :visible="assignTaskDialogVisible"
        :anchors="taskAnchors"
        :submit="handleSubmitTaskAssign"
        @close="onCloseAssignTaskDialog"
      />
    </template>
  </div>
</template>

<style scoped>
.tk-guild-user-table {
  padding: 2rem 1rem;
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .filter-row {
    width: 100%;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  .header-row {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
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
    justify-content: flex-end;
    margin-top: 1rem;
    padding-right: 1rem;
  }
  .main-table {
    flex: 1;
    width: 100%;
  }
}
</style>
