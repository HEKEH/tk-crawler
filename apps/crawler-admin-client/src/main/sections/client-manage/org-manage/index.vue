<script setup lang="ts">
import type {
  CreateOrgRequest,
  CreateOrgResponse,
  GetOrgListResponseData,
  OrganizationItem,
  UpdateOrgRequest,
  UpdateOrgResponse,
} from '@tk-crawler/biz-shared';
import { useQuery } from '@tanstack/vue-query';
import { AREA_NAME_MAP, OrganizationStatus } from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  AreaTooltipIcon,
  confirmAfterSeconds,
  RefreshButton,
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
import { omit } from 'lodash';
import { markRaw, onBeforeUnmount, ref } from 'vue';
import {
  createOrg,
  deleteOrg,
  getOrgList,
  updateOrg,
  updateOrgMembership,
} from '../../../requests';
import OrgFormDialog from './org-form-dialog.vue';
import OrgMembershipDialog from './org-membership-dialog.vue';

defineOptions({
  name: 'OrgManage',
});

const props = defineProps<{
  model: {
    refresh?: () => void;
    onOrgMembersManage: (org: OrganizationItem) => void;
    onOrgDelete: (org: OrganizationItem) => void;
  };
}>();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(10);
const sortField = ref<keyof OrganizationItem>();
const sortOrder = ref<'ascending' | 'descending'>();

const { data, isLoading, isError, error, refetch } = useQuery<
  GetOrgListResponseData | undefined
>({
  queryKey: ['orgs', pageNum, pageSize, sortField, sortOrder],
  retry: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getOrgList({
      page_num: pageNum.value,
      page_size: pageSize.value,
      order_by: orderBy,
    });
    return response.data;
  },
  placeholderData: previousData => previousData,
});

// eslint-disable-next-line vue/no-mutating-props
props.model.refresh = markRaw(refetch);
onBeforeUnmount(() => {
  // eslint-disable-next-line vue/no-mutating-props
  props.model.refresh = undefined;
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof OrganizationItem;
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

async function toggleDisableItem(row: OrganizationItem) {
  let updateResp: UpdateOrgResponse;
  if (row.status === OrganizationStatus.normal) {
    try {
      await ElMessageBox.confirm('确定要禁用该机构吗？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      });
    } catch {
      return;
    }
    updateResp = await updateOrg({
      id: row.id,
      status: OrganizationStatus.disabled,
    });
  } else {
    updateResp = await updateOrg({
      id: row.id,
      status: OrganizationStatus.normal,
    });
  }
  if (updateResp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('操作成功');
  }
}

async function deleteOrganization(item: OrganizationItem) {
  try {
    const message = `确定要删除机构 ${item.name} 吗？删除后将无法恢复。一般情况下，更推荐使用禁用`;
    await confirmAfterSeconds(message);
    props.model.onOrgDelete(item);
  } catch {
    return;
  }
  const resp = await deleteOrg({ id: item.id });
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('删除成功');
  }
}

const formDialogVisible = ref(false);
const formData = ref<Partial<OrganizationItem>>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: OrganizationItem) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleCreateOrEdit(data: Partial<OrganizationItem>) {
  let result: CreateOrgResponse | UpdateOrgResponse;
  if (formMode.value === 'create') {
    result = await createOrg(data as CreateOrgRequest);
  } else {
    result = await updateOrg(
      omit(data, ['created_at', 'updated_at']) as UpdateOrgRequest,
    );
  }
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  onCloseFormDialog();
  ElMessage.success('保存成功');
}

const orgMembershipDialogVisible = ref(false);
const orgMembershipEditId = ref<string>();

function openUpdateOrgMembershipDialog(item: OrganizationItem) {
  orgMembershipEditId.value = item.id;
  orgMembershipDialogVisible.value = true;
}
async function handleUpdateOrgMembership(data: { membership_days: number }) {
  const resp = await updateOrgMembership({
    id: orgMembershipEditId.value!,
    membership_days: data.membership_days,
  });
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    onCloseOrgMembershipDialog();
    ElMessage.success('保存成功');
  }
}
function onCloseOrgMembershipDialog() {
  orgMembershipDialogVisible.value = false;
  orgMembershipEditId.value = undefined;
}

function onManageOrgMembers(org: OrganizationItem) {
  props.model.onOrgMembersManage(org);
}
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="org-manage">
    <div v-if="isError" class="org-manage-error">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="header-row">
        <div class="left-part">
          <ElButton size="small" type="primary" @click="onAddItem">
            添加机构
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
        <ElTableColumn fixed prop="id" label="机构ID" min-width="100" />
        <ElTableColumn fixed prop="name" label="机构名称" min-width="100" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElTag
              :type="
                scope.row.status === OrganizationStatus.normal
                  ? 'success'
                  : 'danger'
              "
            >
              {{
                scope.row.status === OrganizationStatus.normal ? '正常' : '禁用'
              }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="membership_start_at"
          label="会员开始时间"
          min-width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.membership_start_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="membership_expire_at"
          label="会员到期时间"
          min-width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.membership_expire_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="if_membership_valid"
          label="会员是否有效"
          min-width="120"
        >
          <template #default="scope">
            <ElTag :type="scope.row.if_membership_valid ? 'success' : 'danger'">
              {{ scope.row.if_membership_valid ? '是' : '否' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="areas" label="分区" min-width="160">
          <template #default="scope">
            <div class="area-tag">
              <ElTag
                v-for="area in (scope.row as OrganizationItem).areas"
                :key="area"
                type="success"
                class="area-tag-item"
              >
                {{ AREA_NAME_MAP[area] }}
                <AreaTooltipIcon :area="area" />
              </ElTag>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          sortable="custom"
          prop="user_count"
          label="用户数量"
          min-width="120"
        />
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
        <ElTableColumn prop="remark" label="备注" min-width="100" />
        <ElTableColumn fixed="right" label="操作" min-width="220">
          <template #default="scope">
            <div class="action-row">
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
                  scope.row.status === OrganizationStatus.normal
                    ? 'danger'
                    : 'primary'
                "
                size="small"
                @click.prevent="toggleDisableItem(scope.row)"
              >
                {{
                  scope.row.status === OrganizationStatus.normal
                    ? '禁用'
                    : '启用'
                }}
              </ElButton>
              <ElButton
                link
                type="danger"
                size="small"
                @click.prevent="deleteOrganization(scope.row)"
              >
                删除机构
              </ElButton>
            </div>
            <div class="action-row">
              <ElButton
                link
                type="primary"
                size="small"
                @click.prevent="onManageOrgMembers(scope.row)"
              >
                管理成员
              </ElButton>
              <ElButton
                link
                type="primary"
                size="small"
                @click.prevent="openUpdateOrgMembershipDialog(scope.row)"
              >
                新增或延长会员
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
  <OrgFormDialog
    :visible="formDialogVisible"
    :mode="formMode"
    :initial-data="formData"
    :submit="handleCreateOrEdit"
    @close="onCloseFormDialog"
  />

  <OrgMembershipDialog
    :visible="orgMembershipDialogVisible"
    :submit="handleUpdateOrgMembership"
    @close="onCloseOrgMembershipDialog"
  />
</template>

<style scoped>
.org-manage {
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
  .org-manage-error {
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
  .area-tag {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .main-table {
    flex: 1;
    width: 100%;
  }
  .area-tag-item {
    :global(.el-tag__content) {
      display: flex;
      align-items: center;
      column-gap: 6px;
    }
  }
}
</style>
