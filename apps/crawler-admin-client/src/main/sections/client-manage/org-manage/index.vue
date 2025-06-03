<script setup lang="ts">
import type {
  CreateOrgRequest,
  CreateOrgResponse,
  GetOrgListResponseData,
  OrganizationItem,
  UpdateOrgRequest,
  UpdateOrgResponse,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import type { FilterViewValues } from './filter';
import { useQuery } from '@tanstack/vue-query';
import { AREA_NAME_MAP, OrganizationStatus } from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  AreaTooltipIcon,
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
import { omit } from 'lodash';
import { computed, markRaw, onBeforeUnmount, ref } from 'vue';
import {
  createOrg,
  deleteOrg,
  getOrgList,
  updateOrg,
  updateOrgMembership,
} from '../../../requests';
import { useGlobalStore } from '../../../utils';
import {
  DefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import OrgFormDialog from './org-form-dialog.vue';
import OrgManageFilter from './org-manage-filter.vue';
import OrgMembershipDialog from './org-membership-dialog.vue';

defineOptions({
  name: 'OrgManage',
});

const props = defineProps<{
  model: {
    refresh?: () => void;
    onOrgMembersManage: (org: OrganizationItem) => void;
    onOrgDelete: (org: OrganizationItem) => void;
    onMobileDevicesManage: (org: OrganizationItem) => void;
  };
}>();

interface ScopeType {
  row: OrganizationItem;
  column: TableColumnCtx<OrganizationItem>;
  $index: number;
}

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);
const isWeb = useIsWebSize();
const areasLimit = computed(() =>
  globalStore.userProfile?.isAdmin ? undefined : 2,
);

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(10);
const sortField = ref<keyof OrganizationItem>();
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

const { data, isLoading, refetch } = useQuery<
  GetOrgListResponseData | undefined
>({
  queryKey: ['orgs', token, pageNum, pageSize, sortField, sortOrder, filters],
  retry: false,
  // refetchOnWindowFocus: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getOrgList(
      {
        page_num: pageNum.value,
        page_size: pageSize.value,
        order_by: orderBy,
        filter: transformFilterViewValuesToFilterValues(filters.value),
      },
      token.value,
    );
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
    updateResp = await updateOrg(
      {
        id: row.id,
        status: OrganizationStatus.disabled,
      },
      token.value,
    );
  } else {
    updateResp = await updateOrg(
      {
        id: row.id,
        status: OrganizationStatus.normal,
      },
      token.value,
    );
  }
  if (updateResp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('操作成功');
  }
}

async function deleteOrganization(item: OrganizationItem) {
  try {
    const message = `确定要删除机构 「${item.name}」 吗？删除后将无法恢复。一般情况下，更推荐使用禁用`;
    await confirmAfterSeconds(message);
    props.model.onOrgDelete(item);
  } catch {
    return;
  }
  const resp = await deleteOrg({ id: item.id }, token.value);
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
async function handleCreateOrEdit(
  data: Partial<OrganizationItem> & { membership_days?: number },
) {
  let result: CreateOrgResponse | UpdateOrgResponse;
  if (formMode.value === 'create') {
    result = await createOrg(data as CreateOrgRequest, token.value);
  } else {
    result = await updateOrg(
      omit(data, ['created_at', 'updated_at']) as UpdateOrgRequest,
      token.value,
    );
  }
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await Promise.all([
    refetch(),
    formMode.value === 'create' && globalStore.refreshUserProfile(),
  ]);
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
  const resp = await updateOrgMembership(
    {
      id: orgMembershipEditId.value!,
      membership_days: data.membership_days,
    },
    token.value,
  );
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await Promise.all([refetch(), globalStore.refreshUserProfile()]);
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
function onManageMobileDevices(org: OrganizationItem) {
  props.model.onMobileDevicesManage(org);
}
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="org-manage">
    <!-- <div v-if="isError" class="org-manage-error">
      {{ error?.message }}
    </div> -->
    <div v-if="globalStore.userProfile.needToCharge" class="balance-row">
      <div class="balance-row-text">
        <span>账户余额: </span>
        <span class="font-bold"
          >{{ globalStore.userProfile.balance?.toFixed(2) }} 元</span
        >
      </div>
    </div>
    <div class="filter-row">
      <OrgManageFilter
        :model-value="filters"
        @change="handleFilterChange"
        @reset="handleFilterReset"
      />
    </div>
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
    >
      <ElTableColumn
        fixed
        prop="id"
        label="ID"
        :min-width="isWeb ? 100 : 60"
        sortable="custom"
      />
      <ElTableColumn
        fixed
        prop="name"
        label="机构名称"
        :min-width="isWeb ? 120 : 90"
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
        :min-width="isWeb ? 180 : 120"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.membership_start_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="membership_expire_at"
        label="会员到期时间"
        :min-width="isWeb ? 180 : 120"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.membership_expire_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="if_membership_valid"
        label="会员是否有效"
        :min-width="isWeb ? 120 : 100"
      >
        <template #default="scope: ScopeType">
          <ElTag :type="scope.row.if_membership_valid ? 'success' : 'danger'">
            {{ scope.row.if_membership_valid ? '是' : '否' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="areas" label="分区" :min-width="isWeb ? 160 : 100">
        <template #default="scope: ScopeType">
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
        :min-width="isWeb ? 120 : 100"
      />
      <ElTableColumn
        sortable="custom"
        prop="mobile_device_limit"
        label="移动设备上限"
        :min-width="isWeb ? 140 : 120"
      />
      <ElTableColumn
        prop="owner_id"
        sortable="custom"
        label="经销商"
        :min-width="isWeb ? 120 : 100"
      >
        <template #default="scope: ScopeType">
          {{ scope.row.owner?.username || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="created_at"
        label="创建时间"
        :min-width="isWeb ? 180 : 120"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.created_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="updated_at"
        label="更新时间"
        :min-width="isWeb ? 180 : 120"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.updated_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="remark" label="备注" :min-width="isWeb ? 100 : 70" />
      <ElTableColumn
        :fixed="isWeb ? 'right' : undefined"
        label="操作"
        :min-width="isWeb ? 220 : 180"
      >
        <template #default="scope: ScopeType">
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
                scope.row.status === OrganizationStatus.normal ? '禁用' : '启用'
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
              @click.prevent="onManageMobileDevices(scope.row)"
            >
              管理移动设备
            </ElButton>
          </div>
          <div class="action-row">
            <ElButton
              link
              type="primary"
              size="small"
              @click.prevent="openUpdateOrgMembershipDialog(scope.row)"
            >
              会员时长调整
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
        :pager-count="isWeb ? 7 : 3"
        :total="data?.total"
        @size-change="pageSize = $event"
        @current-change="pageNum = $event"
      />
    </div>
  </div>
  <OrgFormDialog
    :visible="formDialogVisible"
    :mode="formMode"
    :initial-data="formData"
    :areas-limit="areasLimit"
    :submit="handleCreateOrEdit"
    @close="onCloseFormDialog"
  />

  <OrgMembershipDialog
    :visible="orgMembershipDialogVisible"
    :submit="handleUpdateOrgMembership"
    @close="onCloseOrgMembershipDialog"
  />
</template>

<style lang="scss" scoped>
.org-manage {
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  .balance-row {
    width: 100%;
    overflow: hidden;
    margin-bottom: 1rem;
    @include mobile {
      margin-bottom: 0.5rem;
    }
    .balance-row-text {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--el-text-color-regular);
      @include mobile {
        padding-left: 0.5rem;
        font-size: 0.75rem;
      }
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
    @include mobile {
      justify-content: center;
    }
    @include web {
      justify-content: flex-end;
    }
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
