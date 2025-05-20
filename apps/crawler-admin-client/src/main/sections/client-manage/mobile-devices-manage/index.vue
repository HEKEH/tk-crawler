<script setup lang="ts">
import type {
  GetMobileDeviceListResponseData,
  MobileDeviceItem,
  OrganizationItem,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { useQuery } from '@tanstack/vue-query';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import { RefreshButton, useIsWebSize } from '@tk-crawler/view-shared';
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import { ref } from 'vue';
import { deleteMobileDevice, getMobileDeviceList } from '../../../requests';
import { useGlobalStore } from '../../../utils';

defineOptions({
  name: 'MobileDevicesManage',
});

const props = defineProps<{
  model: {
    org: OrganizationItem;
  };
}>();

interface ScopeType {
  row: Required<MobileDeviceItem>;
  column: TableColumnCtx<MobileDeviceItem>;
  $index: number;
}

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(10);
const sortField = ref<keyof MobileDeviceItem>();
const sortOrder = ref<'ascending' | 'descending'>();
const globalStore = useGlobalStore();
const isWeb = useIsWebSize();

const { data, isLoading, refetch } = useQuery<
  GetMobileDeviceListResponseData | undefined
>({
  queryKey: [
    'mobile-devices',
    props.model.org.id,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
  ],
  retry: false,
  // refetchOnWindowFocus: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getMobileDeviceList(
      {
        org_id: props.model.org.id,
        page_num: pageNum.value,
        page_size: pageSize.value,
        order_by: orderBy,
      },
      globalStore.token,
    );
    return response.data;
  },
  placeholderData: previousData => previousData,
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof MobileDeviceItem;
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

async function deleteItem(item: MobileDeviceItem) {
  try {
    await ElMessageBox.confirm(
      item.device_name
        ? `确定要删除设备 「${item.device_name}」 吗？`
        : '确定要删除设备吗？',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  const resp = await deleteMobileDevice(
    {
      id: item.id,
      org_id: props.model.org.id,
    },
    globalStore.token,
  );
  if (resp.status_code === RESPONSE_CODE.SUCCESS) {
    await refetch();
    ElMessage.success('删除成功');
  }
}
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="mobile-devices-manage">
    <!-- <div v-if="isError" class="mobile-devices-manage-error">
      {{ error?.message }}
    </div> -->
    <div class="header-row">
      <div class="left-part">
        <span class="text-xs text-gray-500 font-medium md:text-sm">
          {{ `设备数量上限: ${props.model.org.mobile_device_limit}台` }}
        </span>
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
        prop="id"
        label="ID"
        sortable="custom"
        :min-width="isWeb ? 100 : 60"
      />
      <ElTableColumn
        prop="device_id"
        label="设备ID"
        sortable="custom"
        :min-width="isWeb ? 120 : 90"
      />
      <ElTableColumn
        prop="device_name"
        label="设备名"
        sortable="custom"
        :min-width="isWeb ? 120 : 90"
      />
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
      <ElTableColumn
        :fixed="isWeb ? 'right' : undefined"
        label="操作"
        :min-width="isWeb ? 180 : 120"
      >
        <template #default="scope: ScopeType">
          <div>
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
        :pager-count="isWeb ? 7 : 3"
        :total="data?.total"
        @size-change="pageSize = $event"
        @current-change="pageNum = $event"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-devices-manage {
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
  .mobile-devices-manage-error {
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
