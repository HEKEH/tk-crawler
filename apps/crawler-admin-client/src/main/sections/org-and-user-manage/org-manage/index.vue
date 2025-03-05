<script setup lang="ts">
import type {
  CreateOrgRequest,
  GetOrgListResponseData,
  OrganizationItem,
  UpdateOrgRequest,
} from '@tk-crawler/biz-shared';
import { useQuery } from '@tanstack/vue-query';
import { OrganizationStatus } from '@tk-crawler/biz-shared';
import { formatDateTime } from '@tk-crawler/shared';
import {
  ElButton,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { ref } from 'vue';
import { createOrg, getOrgList, updateOrg } from '../../../requests';
import OrgDialog from './org-dialog.vue';

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
    const response = await getOrgList({
      page_num: pageNum.value,
      page_size: pageSize.value,
    });
    return response.data;
  },
});

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

function onAddItem() {
  orgDialogInitialData.value = undefined;
  orgDialogMode.value = 'create';
  orgDialogVisible.value = true;
}
function onEditItem(item: OrganizationItem) {
  orgDialogInitialData.value = item;
  orgDialogMode.value = 'edit';
  orgDialogVisible.value = true;
}
function onCloseDialog() {
  orgDialogVisible.value = false;
  orgDialogInitialData.value = undefined;
  orgDialogMode.value = 'create';
}
async function handleSubmit(data: Partial<OrganizationItem>) {
  if (orgDialogMode.value === 'create') {
    await createOrg(data as CreateOrgRequest);
  } else {
    await updateOrg(data as UpdateOrgRequest);
  }
  refetch();
  onCloseDialog();
}
</script>

<template>
  <div v-loading="isLoading" class="org-manage">
    <template v-if="!isLoading">
      <div v-if="isError" class="org-manage-error">
        {{ error?.message }}
      </div>
      <template v-if="!isError">
        <div class="header-row">
          <ElButton type="primary" @click="onAddItem"> 添加组织 </ElButton>
        </div>
        <ElTable :data="data?.list" style="width: 100%">
          <ElTableColumn fixed prop="id" label="组织ID" min-width="100" />
          <ElTableColumn prop="name" label="组织名称" min-width="100" />
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
                  scope.row.status === OrganizationStatus.normal
                    ? '正常'
                    : '禁用'
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
          <ElTableColumn fixed="right" label="操作" min-width="160">
            <template #default="scope">
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
    </template>
  </div>
  <OrgDialog
    :visible="orgDialogVisible"
    :mode="orgDialogMode"
    :initial-data="orgDialogInitialData"
    :submit="handleSubmit"
    @close="onCloseDialog"
  />
</template>

<style scoped>
.org-manage {
  padding: 1rem;
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  .header-row {
    margin-bottom: 0.5rem;
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
