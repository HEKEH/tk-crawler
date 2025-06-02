<script setup lang="ts">
import type {
  CreateSystemAdminUserRequest,
  CreateSystemAdminUserResponse,
  SystemAdminUserInfo,
  UpdateSystemAdminUserResponse,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import type { FilterViewValues } from './filter';
import {
  AdminUserRoleMap,
  SystemAdminUserRole,
  SystemAdminUserStatus,
} from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  confirmAfterSeconds,
  RefreshButton,
  useIsWebSize,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { computed, ref } from 'vue';
import { useGetAdminUserList } from '../../../hooks';
import {
  createSystemAdminUser,
  deleteSystemAdminUser,
  updateSystemAdminUser,
} from '../../../requests';
import { useGlobalStore } from '../../../utils';
import {
  getDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import SystemAdminUserFilter from './filter.vue';
import FormDialog from './user-form-dialog.vue';

defineOptions({
  name: 'SystemAdminUsersManage',
});

interface ScopeType {
  row: Omit<SystemAdminUserInfo, 'password'>;
  column: TableColumnCtx<Omit<SystemAdminUserInfo, 'password'>>;
  $index: number;
}

const isWeb = useIsWebSize();

const tableRef = ref<InstanceType<typeof ElTable>>();
const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);

const pageNum = ref(1);
const pageSize = ref(10);
const sortField = ref<keyof SystemAdminUserInfo>();
const sortOrder = ref<'ascending' | 'descending'>();

const orderBy = computed(() => {
  return sortField.value
    ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
    : undefined;
});

const defaultFilterViewValues = computed(() => getDefaultFilterViewValues());

// 过滤条件
const filters = ref<FilterViewValues>(defaultFilterViewValues.value);

// 处理过滤器变化
function handleFilterChange(_filters: FilterViewValues) {
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

const { data, isLoading, refetch } = useGetAdminUserList(
  {
    pageNum,
    pageSize,
    orderBy,
    filter: queryFilter,
  },
  token,
);
// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof SystemAdminUserInfo;
  order: 'ascending' | 'descending' | null;
}) {
  sortField.value = order ? prop : undefined;
  sortOrder.value = order || undefined;
}

// 为了手动refreshing的时候看得出效果
const isRefreshing = ref(false);
function resetSort() {
  tableRef.value?.clearSort();
  sortField.value = undefined;
  sortOrder.value = undefined;
}
function refresh() {
  isRefreshing.value = true;
  return refetch().finally(() => {
    isRefreshing.value = false;
  });
}

async function deleteItem(item: Omit<SystemAdminUserInfo, 'password'>) {
  try {
    await confirmAfterSeconds(
      `确定要删除用户「${item.username}」吗？删除后将无法恢复`,
    );
  } catch {
    return;
  }
  const resp = await deleteSystemAdminUser(
    {
      id: item.id,
    },
    token.value,
  );
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('删除成功');
  }
}

const formDialogVisible = ref(false);
const formData = ref<Partial<SystemAdminUserInfo>>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: Omit<SystemAdminUserInfo, 'password'>) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleSubmitCreateOrEdit(data: Partial<SystemAdminUserInfo>) {
  let result: CreateSystemAdminUserResponse | UpdateSystemAdminUserResponse;
  if (formMode.value === 'create') {
    result = await createSystemAdminUser(
      data as CreateSystemAdminUserRequest,
      token.value,
    );
  } else {
    result = await updateSystemAdminUser(
      {
        data: { id: data.id!, ...data },
      },
      token.value,
    );
  }
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  onCloseFormDialog();
  ElMessage.success('保存成功');
}
async function toggleDisableItem(row: SystemAdminUserInfo) {
  let updateResp: UpdateSystemAdminUserResponse;
  if (row.status === SystemAdminUserStatus.normal) {
    try {
      await ElMessageBox.confirm('确定要禁用该用户吗？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      });
    } catch {
      return;
    }
    updateResp = await updateSystemAdminUser(
      {
        data: {
          id: row.id,
          status: SystemAdminUserStatus.disabled,
        },
      },
      token.value,
    );
  } else {
    updateResp = await updateSystemAdminUser(
      {
        data: { id: row.id, status: SystemAdminUserStatus.normal },
      },
      token.value,
    );
  }
  if (updateResp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('操作成功');
  }
}
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="admin-user-manage">
    <!-- <div v-if="isError" class="admin-user-manage-error">
      {{ error?.message }}
    </div> -->
    <div class="filter-row">
      <SystemAdminUserFilter
        :model-value="filters"
        @change="handleFilterChange"
        @reset="handleFilterReset"
      />
    </div>
    <div class="header-row">
      <div class="left-part">
        <ElButton
          v-if="globalStore.userProfile.isAdmin"
          size="small"
          type="primary"
          @click="onAddItem"
        >
          添加用户
        </ElButton>
      </div>
      <div class="right-part">
        <ElButton type="default" size="small" @click="resetSort">
          重置排序
        </ElButton>
        <RefreshButton @click="refresh" />
      </div>
    </div>
    <ElTable
      ref="tableRef"
      :size="!isWeb ? 'small' : undefined"
      :data="data?.list"
      class="main-table"
      :default-sort="
        sortField && sortOrder
          ? { prop: sortField, order: sortOrder }
          : undefined
      "
      row-key="id"
      @sort-change="handleSortChange"
    >
      <ElTableColumn
        fixed="left"
        prop="id"
        label="ID"
        :min-width="!isWeb ? 60 : 80"
        sortable="custom"
      />
      <ElTableColumn
        prop="username"
        label="用户名"
        :fixed="!isWeb ? 'left' : undefined"
        :min-width="!isWeb ? 80 : 100"
        sortable="custom"
      />
      <ElTableColumn
        prop="status"
        label="状态"
        :min-width="isWeb ? 100 : 70"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          <ElTag
            size="small"
            :type="
              scope.row.status === SystemAdminUserStatus.normal
                ? 'success'
                : 'danger'
            "
          >
            {{
              scope.row.status === SystemAdminUserStatus.normal
                ? '正常'
                : '禁用'
            }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="role_id"
        label="角色"
        min-width="100"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          <ElTag
            size="small"
            :type="
              scope.row.role_id === SystemAdminUserRole.ADMIN
                ? 'primary'
                : 'info'
            "
          >
            {{ AdminUserRoleMap[scope.row.role_id] }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="created_at"
        label="创建时间"
        min-width="180"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.created_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="updated_at"
        label="更新时间"
        min-width="180"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.updated_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="globalStore.userProfile.isAdmin"
        :fixed="isWeb ? 'right' : undefined"
        label="操作"
        min-width="160"
      >
        <template #default="scope: ScopeType">
          <div>
            <ElButton
              link
              type="primary"
              size="small"
              @click.prevent="onEditItem(scope.row)"
            >
              编辑
            </ElButton>
            <ElButton
              :disabled="scope.row.id === globalStore.userProfile.userId"
              link
              :type="
                scope.row.status === SystemAdminUserStatus.normal
                  ? 'danger'
                  : 'primary'
              "
              size="small"
              @click.prevent="toggleDisableItem(scope.row)"
            >
              {{
                scope.row.status === SystemAdminUserStatus.normal
                  ? '禁用'
                  : '启用'
              }}
            </ElButton>
            <ElButton
              link
              type="danger"
              size="small"
              :disabled="scope.row.id === globalStore.userProfile.userId"
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
        size="small"
        background
        :page-size="pageSize"
        :current-page="pageNum"
        layout="total, sizes, prev, pager, next"
        :total="data?.total"
        :pager-count="isWeb ? 7 : 3"
        @size-change="pageSize = $event"
        @current-change="pageNum = $event"
      />
    </div>
  </div>
  <FormDialog
    :visible="formDialogVisible"
    :mode="formMode"
    :initial-data="formData"
    :submit="handleSubmitCreateOrEdit"
    @close="onCloseFormDialog"
  />
</template>

<style lang="scss" scoped>
.admin-user-manage {
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  @include web {
    padding: 2rem 1rem;
  }
  @include mobile {
    padding: 1rem;
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
  .admin-user-manage-error {
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
}
</style>
