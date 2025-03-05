<script setup lang="ts">
import type { GetOrgListResponseData } from '@tk-crawler/biz-shared';
import { useQuery } from '@tanstack/vue-query';
import { formatDateTime } from '@tk-crawler/shared';
import { ElButton, ElTable, ElTableColumn } from 'element-plus';
import { getOrgList } from '../../requests';

defineOptions({
  name: 'OrgManage',
});

const { data, isLoading, isError, error } = useQuery<
  GetOrgListResponseData | undefined
>({
  queryKey: ['orgs'],
  retry: false,
  queryFn: async () => {
    const response = await getOrgList({
      page_num: 1,
      page_size: 10,
    });
    return response.data;
  },
});

function deleteRow(id: string) {
  console.log('deleteRow', id);
}

function onAddItem() {}
</script>

<template>
  <div v-loading="isLoading" class="org-manage">
    <template v-if="!isLoading">
      <div v-if="isError" class="org-manage-error">
        {{ error?.message }}
      </div>
      <template v-if="!isError">
        <ElTable :data="data?.list" style="width: 100%">
          <ElTableColumn fixed prop="id" label="组织ID" min-width="200" />
          <ElTableColumn prop="name" label="组织名称" min-width="100" />
          <ElTableColumn prop="status" label="状态" min-width="100" />
          <ElTableColumn
            prop="membership_start_at"
            label="会员开始时间"
            min-width="120"
          >
            <template #default="scope">
              {{ formatDateTime(scope.row.membership_start_at) }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="membership_expire_at"
            label="会员到期时间"
            min-width="120"
          >
            <template #default="scope">
              {{ formatDateTime(scope.row.membership_expire_at) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="created_at" label="创建时间" min-width="120">
            <template #default="scope">
              {{ formatDateTime(scope.row.created_at) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="updated_at" label="更新时间" min-width="120">
            <template #default="scope">
              {{ formatDateTime(scope.row.updated_at) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="remark" label="备注" min-width="100" />
          <ElTableColumn fixed="right" label="Operations" min-width="120">
            <template #default="scope">
              <ElButton
                link
                type="primary"
                size="small"
                @click.prevent="deleteRow(scope.row.id)"
              >
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <ElButton class="mt-4" style="width: 100%" @click="onAddItem">
          添加组织
        </ElButton>
      </template>
    </template>
  </div>
</template>

<style scoped>
.org-manage {
  padding: 1rem;
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  .org-manage-error {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-danger);
  }
}
</style>
