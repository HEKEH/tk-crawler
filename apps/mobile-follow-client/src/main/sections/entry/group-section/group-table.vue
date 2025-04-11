<script setup lang="tsx">
import { RefreshRight } from '@element-plus/icons-vue';
import type {
  AnchorFollowGroupItem,
  CreateAnchorFollowGroupRequest,
  UpdateAnchorFollowGroupResponse,
} from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  ElButton,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import { computed, onActivated, ref } from 'vue';
import { useGetFollowGroupList } from '../../../hooks';
import {
  clearAnchorFollowGroup,
  createAnchorFollowGroup,
  deleteAnchorFollowGroup,
  updateAnchorFollowGroup,
} from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import CreateGroupDialog from '../anchor-section/create-group-dialog.vue';
import ClearGroupMessage from './clear-group-message.vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import GroupFilter from './group-filter.vue';
import GroupFormDialog from './group-form-dialog.vue';

defineOptions({
  name: 'GroupTable',
});

const globalStore = useGlobalStore();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const sortField = ref<keyof AnchorFollowGroupItem>();
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

const { data, isLoading, isError, error, refetch } = useGetFollowGroupList({
  orgId: globalStore.orgId,
  pageNum,
  pageSize,
  orderBy: computed(() =>
    sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined,
  ),
  filter: computed(() =>
    transformFilterViewValuesToFilterValues(filters.value),
  ),
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof AnchorFollowGroupItem;
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

// 删除分组
async function deleteItem(item: AnchorFollowGroupItem) {
  try {
    await ElMessageBox.confirm(`确定要删除分组「${item.name}」吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await deleteAnchorFollowGroup({ id: [item.id], org_id: globalStore.orgId });
  ElMessage.success({ message: '删除成功', type: 'success', duration: 2000 });
  await refetch();
}

// 清除主播
async function handleClearAnchors(item: AnchorFollowGroupItem) {
  try {
    await ElMessageBox.confirm(
      `确定要清除分组「${item.name}」中的所有主播吗？`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  await deleteAnchorFollowGroup({
    id: [item.id],
    org_id: globalStore.orgId,
    only_anchor: true,
  });
  ElMessage.success({ message: '清除成功', type: 'success', duration: 2000 });
  await refetch();
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<AnchorFollowGroupItem[]>([]);

// 处理选择变化
function handleSelectionChange(rows: AnchorFollowGroupItem[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

async function handleBatchDeleteGroups() {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个分组吗？`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  const { data, status_code } = await deleteAnchorFollowGroup({
    org_id: globalStore.orgId,
    id: selectedRows.value.map(item => item.id),
  });
  if (status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }

  ElMessage.success({
    message: `共删除 ${data!.groups_count} 个分组，以及分组中的${data!.deleted_anchor_count} 个主播`,
    type: 'success',
    duration: 2000,
  });
  await refetch();
}

async function handleBatchDeleteAnchorsInGroups() {
  try {
    await ElMessageBox.confirm(
      `确定要清除选中的 ${selectedRows.value.length} 个分组中的所有主播吗？（仅清除主播，分组保留）`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }
  const { data, status_code } = await deleteAnchorFollowGroup({
    org_id: globalStore.orgId,
    id: selectedRows.value.map(item => item.id),
    only_anchor: true,
  });
  if (status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }

  ElMessage.success({
    message: `共删除 ${data!.groups_count} 个分组中的${data!.deleted_anchor_count} 个主播`,
    type: 'success',
    duration: 2000,
  });
  await refetch();
}

async function handleClearGroup() {
  const state = ref({
    clearScope: 'all' as 'all' | 'filtered',
    clearOption: 'only-anchor' as 'all' | 'only-anchor',
  });

  try {
    await ElMessageBox({
      title: '清空数据',
      message: (
        <ClearGroupMessage
          value={state.value}
          filteredRowsTotal={data.value?.total || 0}
          onUpdate={val => {
            state.value = val;
          }}
        />
      ),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    const resp = await clearAnchorFollowGroup({
      org_id: globalStore.orgId,
      only_anchor: state.value.clearOption === 'only-anchor',
      filter:
        state.value.clearOption === 'all'
          ? undefined
          : transformFilterViewValuesToFilterValues(filters.value),
    });

    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message:
        state.value.clearOption === 'only-anchor'
          ? `共清空 ${resp.data!.groups_count} 个分组中的 ${resp.data!.deleted_anchor_count} 个主播`
          : `共清空 ${resp.data!.groups_count} 个分组，${resp.data!.deleted_anchor_count} 个主播`,
      type: 'success',
      duration: 2000,
    });

    await refetch();
  } catch {}
}

onActivated(refetch);

const formDialogVisible = ref(false);
const formData = ref<AnchorFollowGroupItem>();

function onEditItem(item: AnchorFollowGroupItem) {
  formData.value = item;
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
}
async function handleEdit(data: Partial<AnchorFollowGroupItem>) {
  const result: UpdateAnchorFollowGroupResponse = await updateAnchorFollowGroup(
    {
      id: formData.value!.id,
      org_id: globalStore.orgId,
      name: data.name!,
    },
  );
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  onCloseFormDialog();
  ElMessage.success('保存成功');
}

const createGroupDialogVisible = ref(false);
function openCreateGroupDialog() {
  createGroupDialogVisible.value = true;
}
function closeCreateGroupDialog() {
  createGroupDialogVisible.value = false;
}
async function handleGroupCreateSubmit(
  data: Omit<CreateAnchorFollowGroupRequest, 'org_id'>,
) {
  const res = await createAnchorFollowGroup({
    name: data.name,
    anchor_table_ids: data.anchor_table_ids,
    org_id: globalStore.orgId,
  });
  if (res.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  ElMessage.success({
    message: '新建分组成功',
    type: 'success',
    duration: 2000,
  });
  closeCreateGroupDialog();
  await refetch();
}
function handleCollectAnchorsToGroup(item: AnchorFollowGroupItem) {
  globalStore.goToCollectPageWithGroup(item);
}
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="group-table">
    <div v-if="isError" class="group-table-error">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <GroupFilter
          :model-value="filters"
          @change="handleFilterChange"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part">
          <ElButton type="primary" size="small" @click="openCreateGroupDialog">
            新建分组
          </ElButton>
        </div>
        <div class="right-part">
          <ElButton
            :disabled="!hasSelectedRows"
            type="danger"
            size="small"
            @click="handleBatchDeleteAnchorsInGroups"
          >
            批量清除主播
          </ElButton>
          <ElButton
            :disabled="!hasSelectedRows"
            type="danger"
            size="small"
            @click="handleBatchDeleteGroups"
          >
            批量删除分组
          </ElButton>
          <ElButton type="danger" size="small" @click="handleClearGroup">
            清空数据
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
        <!-- <ElTableColumn prop="id" label="分组ID" min-width="120" /> -->
        <ElTableColumn prop="name" label="分组名称" min-width="140" />
        <ElTableColumn
          prop="anchors_count"
          label="主播账号数量"
          min-width="140"
          sortable="custom"
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

        <ElTableColumn fixed="right" label="操作" min-width="140">
          <template #default="scope">
            <div>
              <ElButton
                link
                type="primary"
                size="small"
                @click.prevent="handleCollectAnchorsToGroup(scope.row)"
              >
                添加主播
              </ElButton>
              <ElButton
                link
                type="primary"
                size="small"
                @click.prevent="onEditItem(scope.row)"
              >
                编辑
              </ElButton>
            </div>
            <div>
              <ElButton
                link
                type="danger"
                size="small"
                :disabled="scope.row.anchors_count === 0"
                @click.prevent="handleClearAnchors(scope.row)"
              >
                清除主播
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
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          size="small"
          background
          layout="total, sizes, prev, pager, next"
          :total="data?.total || 0"
          class="mt-4"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </template>
  </div>
  <GroupFormDialog
    :visible="formDialogVisible"
    :initial-data="formData"
    :submit="handleEdit"
    @close="onCloseFormDialog"
  />
  <CreateGroupDialog
    :visible="createGroupDialogVisible"
    :submit="handleGroupCreateSubmit"
    @close="closeCreateGroupDialog"
  />
</template>

<style scoped>
.group-table {
  position: relative;
  flex: 1;
  height: fit-content;
  max-height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.filter-row {
  width: 100%;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.header-row {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

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

.header-row-icon {
  cursor: pointer;
  font-size: 18px;
  margin-left: 0.5rem;
}

.header-row-icon:hover {
  color: var(--el-color-primary);
}

.group-table-error {
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
</style>
