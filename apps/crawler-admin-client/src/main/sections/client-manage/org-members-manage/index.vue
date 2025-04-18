<script setup lang="ts">
import type {
  CreateOrgMemberRequest,
  CreateOrgMemberResponse,
  GetOrgMemberListResponseData,
  OrganizationItem,
  OrgMemberItem,
  UpdateOrgMemberResponse,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { useQuery } from '@tanstack/vue-query';
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
import { ref } from 'vue';
import {
  createOrgMember,
  deleteOrgMember,
  getOrgMemberList,
  updateOrgMember,
} from '../../../requests';
import FormDialog from './member-form-dialog.vue';

defineOptions({
  name: 'OrgMembersManage',
});

const props = defineProps<{
  model: {
    org: OrganizationItem;
  };
}>();

interface ScopeType {
  row: Omit<OrgMemberItem, 'password'>;
  column: TableColumnCtx<Omit<OrgMemberItem, 'password'>>;
  $index: number;
}

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(10);
const sortField = ref<keyof OrgMemberItem>();
const sortOrder = ref<'ascending' | 'descending'>();

const { data, isLoading, isError, error, refetch } = useQuery<
  GetOrgMemberListResponseData | undefined
>({
  queryKey: [
    'org-members',
    props.model.org.id,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
  ],
  retry: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getOrgMemberList({
      org_id: props.model.org.id,
      page_num: pageNum.value,
      page_size: pageSize.value,
      order_by: orderBy,
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

const formDialogVisible = ref(false);
const formData = ref<Partial<OrgMemberItem>>();
const formMode = ref<'create' | 'edit'>('create');

async function toggleDisableItem(row: Omit<OrgMemberItem, 'password'>) {
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
    updateResp = await updateOrgMember({
      org_id: row.org_id,
      data: {
        id: row.id,
        status: OrgMemberStatus.disabled,
      },
    });
  } else {
    updateResp = await updateOrgMember({
      org_id: row.org_id,
      data: {
        id: row.id,
        status: OrgMemberStatus.normal,
      },
    });
  }
  if (updateResp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
  }
}

async function deleteItem(item: Omit<OrgMemberItem, 'password'>) {
  try {
    await confirmAfterSeconds(
      `确定要删除成员 ${item.username} 吗？删除后将无法恢复。一般情况下，更推荐使用禁用`,
    );
  } catch {
    return;
  }
  const resp = await deleteOrgMember({
    id: item.id,
    org_id: item.org_id,
  });
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('删除成功');
  }
}

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: Omit<OrgMemberItem, 'password'>) {
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
  const orgId = props.model.org.id;
  let result: CreateOrgMemberResponse | UpdateOrgMemberResponse;
  if (formMode.value === 'create') {
    result = await createOrgMember({
      ...data,
      org_id: orgId,
    } as CreateOrgMemberRequest);
  } else {
    result = await updateOrgMember({
      org_id: orgId,
      data: {
        ...data,
        id: data.id!,
      },
    });
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
      <div class="header-row">
        <div class="left-part">
          <ElButton size="small" type="primary" @click="onAddItem">
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
        <ElTableColumn fixed prop="id" label="ID" min-width="100" />
        <ElTableColumn prop="username" label="登录名" min-width="120" />
        <ElTableColumn prop="display_name" label="显示名" min-width="120" />
        <ElTableColumn prop="email" label="邮箱" min-width="120">
          <template #default="scope: ScopeType">
            {{ scope.row.email || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="mobile" label="手机号" min-width="120">
          <template #default="scope: ScopeType">
            {{ scope.row.mobile || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="role_id" label="角色" min-width="100">
          <template #default="scope: ScopeType">
            <ElTag
              size="small"
              :type="
                scope.row.role_id === OrgMemberRole.admin ? 'primary' : 'info'
              "
            >
              {{
                scope.row.role_id === OrgMemberRole.admin
                  ? '管理员'
                  : '普通成员'
              }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope: ScopeType">
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
        <ElTableColumn fixed="right" label="操作" min-width="220">
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
