<script setup lang="ts">
import type {
  CreateTKGuildUserRequest,
  CreateTKGuildUserResponse,
  GetTKGuildUserListResponseData,
  Region,
  TKGuildUser,
  UpdateTKGuildUserResponse,
} from '@tk-crawler/biz-shared';
import { RefreshRight } from '@element-plus/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import { REGION_LABEL_MAP, TKGuildUserStatus } from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
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
  createTKGuildUser,
  deleteTKGuildUser,
  getTKGuildUserList,
  updateTKGuildUser,
} from '../../../requests/client/tk-guild-user';
import { useGlobalStore } from '../../../utils/vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TKGuildUserFilter from './guild-user-filter.vue';
import FormDialog from './guild-user-form-dialog.vue';

defineOptions({
  name: 'TKGuildUserTable',
});

const globalStore = useGlobalStore();

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

const { data, isLoading, isError, error, refetch } = useQuery<
  GetTKGuildUserListResponseData | undefined
>({
  queryKey: [
    'tk-guild-users',
    globalStore.token,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
    filters,
  ],
  retry: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getTKGuildUserList(
      {
        page_num: pageNum.value,
        page_size: pageSize.value,
        order_by: orderBy,
        filter: transformFilterViewValuesToFilterValues(filters.value),
      },
      globalStore.token,
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

// 刷新功能
const isRefreshing = ref(false);
async function refresh() {
  isRefreshing.value = true;
  return refetch().finally(() => {
    isRefreshing.value = false;
  });
}

// 删除用户
async function deleteUser(user: TKGuildUser) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  const response = await deleteTKGuildUser(
    { ids: [user.id] },
    globalStore.token,
  );

  if (response.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success({ message: '删除成功', type: 'success', duration: 2000 });
    await refetch();
  } else {
    ElMessage.error({
      message: response.message || '删除失败',
      type: 'error',
      duration: 2000,
    });
  }
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
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${selectedRows.value.length} 个用户吗？`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }

  const response = await deleteTKGuildUser(
    { ids: selectedRows.value.map(user => user.id) },
    globalStore.token,
  );

  if (response.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success({
      message: `共删除 ${response.data?.deleted_count} 个用户`,
      type: 'success',
      duration: 2000,
    });
    await refetch();
  } else {
    ElMessage.error({
      message: response.message || '删除失败',
      type: 'error',
      duration: 2000,
    });
  }
}

const formDialogVisible = ref(false);
const formData = ref<Partial<TKGuildUser>>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: TKGuildUser) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleSubmitCreateOrEdit(data: Partial<TKGuildUser>) {
  let result: CreateTKGuildUserResponse | UpdateTKGuildUserResponse;
  const org_id = globalStore.userProfile.orgInfo!.id;
  if (formMode.value === 'create') {
    result = await createTKGuildUser(
      {
        ...data,
        org_id,
      } as CreateTKGuildUserRequest,
      globalStore.token,
    );
  } else {
    result = await updateTKGuildUser(
      {
        data: { id: formData.value!.id!, org_id, ...data },
      },
      globalStore.token,
    );
  }
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  onCloseFormDialog();
  ElMessage.success('保存成功');
}

// 更新用户状态
async function toggleUserStatus(user: TKGuildUser) {
  const newStatus =
    user.status === TKGuildUserStatus.RUNNING
      ? TKGuildUserStatus.STOPPED
      : TKGuildUserStatus.RUNNING;

  const response = await updateTKGuildUser(
    {
      data: {
        id: user.id,
        status: newStatus,
      },
    },
    globalStore.token,
  );

  if (response.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success({
      message: '状态更新成功',
      type: 'success',
      duration: 2000,
    });
    await refetch();
  } else {
    ElMessage.error({
      message: response.message || '更新失败',
      type: 'error',
      duration: 2000,
    });
  }
}

// 获取状态标签类型
function getStatusTagType(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return 'success';
    case TKGuildUserStatus.STOPPED:
      return 'info';
    case TKGuildUserStatus.ERROR:
      return 'danger';
    case TKGuildUserStatus.WAITING:
      return 'primary';
    case TKGuildUserStatus.INACTIVE:
      return 'info';
    case TKGuildUserStatus.WARNING:
      return 'warning';
    default:
      return 'info';
  }
}

// 获取状态显示文本
function getStatusText(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return '运行中';
    case TKGuildUserStatus.STOPPED:
      return '已停止';
    case TKGuildUserStatus.ERROR:
      return '出错';
    case TKGuildUserStatus.WAITING:
      return '等待中';
    case TKGuildUserStatus.INACTIVE:
      return '未激活';
    case TKGuildUserStatus.WARNING:
      return '有警告';
    default:
      return '未知';
  }
}

onActivated(refetch);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="tk-guild-user-table">
    <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <TKGuildUserFilter
          :model-value="filters"
          @change="handleFilterChange"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part">
          <ElButton type="primary" size="small" @click="onAddItem">
            新增用户
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
          <ElButton type="default" size="small" @click="resetSort">
            重置排序
          </ElButton>
          <ElIcon class="header-row-icon" @click="refresh">
            <RefreshRight />
          </ElIcon>
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
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn prop="username" label="用户名" min-width="120" />
        <ElTableColumn prop="regions" label="区域" min-width="120">
          <template #default="scope">
            {{
              (scope.row.regions as Region[])
                .map(item => REGION_LABEL_MAP[item])
                .join(', ') || '-'
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="status"
          label="状态"
          min-width="100"
          sortable="custom"
        >
          <template #default="scope">
            <ElTag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="max_query_per_day"
          label="每天最大查询次数"
          min-width="160"
        />
        <ElTableColumn
          prop="max_query_per_hour"
          label="每小时最大查询次数"
          min-width="160"
        />
        <ElTableColumn
          prop="created_at"
          label="创建时间"
          min-width="205"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="updated_at"
          label="更新时间"
          min-width="205"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <ElButton
                size="small"
                type="primary"
                @click="onEditItem(scope.row)"
              >
                编辑
              </ElButton>
              <ElButton
                size="small"
                :type="
                  scope.row.status === TKGuildUserStatus.RUNNING
                    ? 'warning'
                    : 'success'
                "
                @click="toggleUserStatus(scope.row)"
              >
                {{
                  scope.row.status === TKGuildUserStatus.RUNNING
                    ? '停止'
                    : '启动'
                }}
              </ElButton>
              <ElButton
                size="small"
                type="danger"
                @click="deleteUser(scope.row)"
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
          :page-sizes="[10, 20, 50, 100]"
          :total="data?.total || 0"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>

      <!-- 创建用户对话框 -->
      <FormDialog
        :visible="formDialogVisible"
        :mode="formMode"
        :initial-data="formData"
        :submit="handleSubmitCreateOrEdit"
        @close="onCloseFormDialog"
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
