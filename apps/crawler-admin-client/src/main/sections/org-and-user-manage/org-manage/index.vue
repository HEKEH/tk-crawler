<script setup lang="ts">
import type {
  CreateOrgRequest,
  GetOrgListResponseData,
  OrganizationItem,
  UpdateOrgRequest,
} from '@tk-crawler/biz-shared';
import { RefreshRight } from '@element-plus/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import { OrganizationStatus } from '@tk-crawler/biz-shared';
import { formatDateTime } from '@tk-crawler/shared';
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
import { onActivated, ref } from 'vue';
import {
  createOrg,
  getOrgList,
  updateOrg,
  updateOrgMembership,
} from '../../../requests';
import OrgDialog from './org-dialog.vue';
import OrgMembershipDialog from './org-membership-dialog.vue';

defineOptions({
  name: 'OrgManage',
});

const pageNum = ref(1);
const pageSize = ref(10);
const { data, isLoading, isError, error, refetch } = useQuery<
  GetOrgListResponseData | undefined
>({
  queryKey: ['orgs', pageNum, pageSize],
  retry: false,
  queryFn: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await getOrgList({
      page_num: pageNum.value,
      page_size: pageSize.value,
    });
    return response.data;
  },
});

onActivated(() => {
  refetch();
});

// 为了手动refreshing的时候看得出效果
const isRefreshing = ref(false);
function refresh() {
  isRefreshing.value = true;
  refetch().finally(() => {
    isRefreshing.value = false;
  });
}

const orgDialogVisible = ref(false);
const orgDialogInitialData = ref<Partial<OrganizationItem>>();
const orgDialogMode = ref<'create' | 'edit'>('create');

async function toggleDisableItem(row: OrganizationItem) {
  if (row.status === OrganizationStatus.normal) {
    try {
      await ElMessageBox.confirm('确定要禁用该组织吗？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      });
    } catch {
      return;
    }
    await updateOrg({
      id: row.id,
      status: OrganizationStatus.disabled,
    });
  } else {
    await updateOrg({
      id: row.id,
      status: OrganizationStatus.normal,
    });
  }
  refetch();
}

function onAddOrgItem() {
  orgDialogInitialData.value = undefined;
  orgDialogMode.value = 'create';
  orgDialogVisible.value = true;
}
function onEditOrgItem(item: OrganizationItem) {
  orgDialogInitialData.value = item;
  orgDialogMode.value = 'edit';
  orgDialogVisible.value = true;
}
function onCloseOrgDialog() {
  orgDialogVisible.value = false;
  orgDialogInitialData.value = undefined;
  orgDialogMode.value = 'create';
}
async function handleSubmitOrgData(data: Partial<OrganizationItem>) {
  if (orgDialogMode.value === 'create') {
    await createOrg(data as CreateOrgRequest);
  } else {
    await updateOrg(data as UpdateOrgRequest);
  }
  refetch();
  onCloseOrgDialog();
  ElMessage.success('保存成功');
}

const orgMembershipDialogVisible = ref(false);
const orgMembershipEditId = ref<string>();

function openUpdateOrgMembershipDialog(item: OrganizationItem) {
  orgMembershipEditId.value = item.id;
  orgMembershipDialogVisible.value = true;
}
async function handleUpdateOrgMembership(data: { membership_days: number }) {
  await updateOrgMembership({
    id: orgMembershipEditId.value!,
    membership_days: data.membership_days,
  });
  refetch();
  onCloseOrgMembershipDialog();
  ElMessage.success('保存成功');
}
function onCloseOrgMembershipDialog() {
  orgMembershipDialogVisible.value = false;
  orgMembershipEditId.value = undefined;
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
          <ElButton type="primary" @click="onAddOrgItem"> 添加组织 </ElButton>
        </div>
        <div class="right-part">
          <ElIcon class="org-icon" @click="refresh">
            <RefreshRight />
          </ElIcon>
        </div>
      </div>
      <ElTable :data="data?.list" style="width: 100%">
        <ElTableColumn fixed prop="id" label="组织ID" min-width="100" />
        <ElTableColumn fixed prop="name" label="组织名称" min-width="100" />
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
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.membership_start_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="membership_expire_at"
          label="会员到期时间"
          min-width="180"
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
        <ElTableColumn prop="user_count" label="用户数量" min-width="100" />
        <ElTableColumn prop="created_at" label="创建时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updated_at" label="更新时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="100" />
        <ElTableColumn fixed="right" label="操作" min-width="220">
          <template #default="scope">
            <ElButton
              link
              type="primary"
              size="small"
              @click.prevent="onEditOrgItem(scope.row)"
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
              type="primary"
              size="small"
              @click.prevent="openUpdateOrgMembershipDialog(scope.row)"
            >
              添加会员天数
            </ElButton>
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
  <OrgDialog
    :visible="orgDialogVisible"
    :mode="orgDialogMode"
    :initial-data="orgDialogInitialData"
    :submit="handleSubmitOrgData"
    @close="onCloseOrgDialog"
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
  flex: 1;
  height: 100%;
  overflow: hidden;
  .header-row {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    .left-part {
      display: flex;
      align-items: center;
    }
    .right-part {
      display: flex;
      align-items: center;
    }
  }
  .org-icon {
    cursor: pointer;
    font-size: 18px;
    margin-right: 0.5rem;
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
}
</style>
