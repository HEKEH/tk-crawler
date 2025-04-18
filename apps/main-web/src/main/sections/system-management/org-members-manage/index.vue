<script setup lang="ts">
import type {
  CreateOrgMemberRequest,
  CreateOrgMemberResponse,
  OrgMemberItem,
  UpdateOrgMemberResponse,
} from '@tk-crawler/biz-shared';
import { OrgMemberRole, OrgMemberStatus } from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import { confirmAfterSeconds, RefreshButton } from '@tk-crawler/view-shared';
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
import { useGetOrgMemberList } from '../../../hooks';
import {
  createOrgMember,
  deleteOrgMember,
  updateOrgMember,
} from '../../../requests';
import { useGlobalStore } from '../../../utils';
import FormDialog from './member-form-dialog.vue';
import OrgMemberFilter from './filter.vue';
import {
  FilterViewValues,
  getDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';

defineOptions({
  name: 'OrgMembersManage',
});

const OrgMemberRoleMap = {
  [OrgMemberRole.admin]: '管理员',
  [OrgMemberRole.member]: '普通成员',
};

const tableRef = ref<InstanceType<typeof ElTable>>();
const globalStore = useGlobalStore();

const pageNum = ref(1);
const pageSize = ref(10);
const sortField = ref<keyof OrgMemberItem>();
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

const { data, isLoading, isError, error, refetch } = useGetOrgMemberList(
  {
    pageNum,
    pageSize,
    orderBy,
    filter: queryFilter,
  },
  globalStore.token,
);
// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof OrgMemberItem;
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

async function toggleDisableItem(row: OrgMemberItem) {
  let updateResp: UpdateOrgMemberResponse;
  if (row.status === OrgMemberStatus.normal) {
    try {
      await ElMessageBox.confirm('确定要禁用该用户吗？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      });
    } catch {
      return;
    }
    updateResp = await updateOrgMember(
      {
        id: row.id,
        status: OrgMemberStatus.disabled,
      },
      globalStore.token,
    );
  } else {
    updateResp = await updateOrgMember(
      {
        id: row.id,
        status: OrgMemberStatus.normal,
      },
      globalStore.token,
    );
  }
  if (updateResp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
  }
}

async function deleteItem(item: OrgMemberItem) {
  try {
    await confirmAfterSeconds(
      `确定要删除成员 ${item.username} 吗？删除后将无法恢复。一般情况下，更推荐使用禁用`,
    );
  } catch {
    return;
  }
  const resp = await deleteOrgMember(
    {
      id: item.id,
    },
    globalStore.token,
  );
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('删除成功');
  }
}

const formDialogVisible = ref(false);
const formData = ref<Partial<OrgMemberItem>>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: OrgMemberItem) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleSubmitCreateOrEdit(data: Partial<OrgMemberItem>) {
  let result: CreateOrgMemberResponse | UpdateOrgMemberResponse;
  if (formMode.value === 'create') {
    result = await createOrgMember(
      data as CreateOrgMemberRequest,
      globalStore.token,
    );
  } else {
    result = await updateOrgMember(
      {
        id: data.id!,
        ...data,
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
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="org-member-manage">
    <div v-if="isError" class="org-member-manage-error">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <OrgMemberFilter
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
            添加机构成员
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
          fixed
          prop="id"
          label="ID"
          min-width="100"
          sortable="custom"
        />
        <ElTableColumn
          prop="username"
          label="登录名"
          min-width="120"
          sortable="custom"
        />
        <ElTableColumn
          prop="display_name"
          label="显示名"
          min-width="120"
          sortable="custom"
        />
        <ElTableColumn
          prop="email"
          label="邮箱"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.email || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="mobile"
          label="手机号"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.mobile || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="role_id"
          label="角色"
          min-width="100"
          sortable="custom"
        >
          <template #default="scope">
            {{ OrgMemberRoleMap[scope.row.role_id as OrgMemberRole] }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="status"
          label="状态"
          min-width="100"
          sortable="custom"
        >
          <template #default="scope">
            <ElTag
              :type="
                scope.row.status === OrgMemberStatus.normal
                  ? 'success'
                  : 'danger'
              "
            >
              {{
                scope.row.status === OrgMemberStatus.normal ? '正常' : '禁用'
              }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="created_at"
          label="创建时间"
          min-width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="updated_at"
          label="更新时间"
          min-width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          v-if="globalStore.userProfile.isAdmin"
          fixed="right"
          label="操作"
          min-width="220"
        >
          <template #default="scope">
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
                link
                :type="
                  scope.row.status === OrgMemberStatus.normal
                    ? 'danger'
                    : 'primary'
                "
                size="small"
                @click.prevent="toggleDisableItem(scope.row)"
              >
                {{
                  scope.row.status === OrgMemberStatus.normal ? '禁用' : '启用'
                }}
              </ElButton>
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
          size="small"
          background
          :page-size="pageSize"
          :current-page="pageNum"
          layout="total, sizes, prev, pager, next"
          :total="data?.total"
          class="mt-4"
          @size-change="pageSize = $event"
          @current-change="pageNum = $event"
        />
      </div>
    </template>
  </div>
  <FormDialog
    :visible="formDialogVisible"
    :mode="formMode"
    :initial-data="formData"
    :submit="handleSubmitCreateOrEdit"
    @close="onCloseFormDialog"
  />
</template>

<style scoped>
.org-member-manage {
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
  .org-member-manage-error {
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
