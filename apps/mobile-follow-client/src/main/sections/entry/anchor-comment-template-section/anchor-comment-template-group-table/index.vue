<script setup lang="ts">
import type {
  AnchorCommentTemplateGroup,
  CreateAnchorCommentTemplateGroupResponse,
  GetAnchorCommentTemplateGroupListResponseData,
  UpdateAnchorCommentTemplateGroupResponse,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { useQuery } from '@tanstack/vue-query';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  ClearMessage,
  onKeepAliveActivated,
  RefreshButton,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import { computed, h, reactive, ref } from 'vue';
import {
  clearAnchorCommentTemplateGroup,
  createAnchorCommentTemplateGroup,
  deleteAnchorCommentTemplateGroup,
  getAnchorCommentTemplateGroupList,
  updateAnchorCommentTemplateGroup,
} from '../../../../requests';
import { useGlobalStore } from '../../../../utils/vue';
import AnchorCommentTemplateGroupFilter from './anchor-comment-template-group-filter.vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TemplateGroupFormDialog from './template-group-dialog.vue';

defineOptions({
  name: 'AnchorCommentGroupTable',
});

const emits = defineEmits<{
  (e: 'deleteItems', templateGroupIds: string[]): void;
  (e: 'templateGroupManage', templateGroup: AnchorCommentTemplateGroup): void;
}>();

interface ScopeType {
  row: AnchorCommentTemplateGroup;
  column: TableColumnCtx<AnchorCommentTemplateGroup>;
  $index: number;
}

function onTemplateGroupManage(templateGroup: AnchorCommentTemplateGroup) {
  emits('templateGroupManage', templateGroup);
}

const globalStore = useGlobalStore();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const sortField = ref<keyof AnchorCommentTemplateGroup>();
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

const { data, isLoading, isError, error, refetch } = useQuery<
  GetAnchorCommentTemplateGroupListResponseData | undefined
>({
  queryKey: [
    'anchor-comment-template-groups',
    globalStore.orgId,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
    filters,
  ],
  retry: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getAnchorCommentTemplateGroupList({
      org_id: globalStore.orgId,
      page_num: pageNum.value,
      page_size: pageSize.value,
      order_by: orderBy,
      filter: transformFilterViewValuesToFilterValues(filters.value),
    });
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
  },
  placeholderData: previousData => previousData,
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof AnchorCommentTemplateGroup;
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

// 删除模板分组
async function deleteItem(item: AnchorCommentTemplateGroup) {
  try {
    await ElMessageBox.confirm(`确定要删除模板分组 ${item.name} 吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await deleteAnchorCommentTemplateGroup({
    ids: [item.id],
    org_id: globalStore.orgId,
  });
  ElMessage.success({ message: '删除成功', type: 'success', duration: 2000 });
  emits('deleteItems', [item.id]);
  await refetch();
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<AnchorCommentTemplateGroup[]>([]);

// 处理选择变化
function handleSelectionChange(rows: AnchorCommentTemplateGroup[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${selectedRows.value.length} 个模板分组吗？`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }

  const itemsIds = selectedRows.value.map(item => item.id);
  const { data, status_code } = await deleteAnchorCommentTemplateGroup({
    org_id: globalStore.orgId,
    ids: itemsIds,
  });
  if (status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }

  ElMessage.success({
    message: `共删除 ${data!.deleted_count} 个模板分组`,
    type: 'success',
    duration: 2000,
  });
  emits('deleteItems', itemsIds);
  await refetch();
}

async function handleClearData() {
  const state = reactive({
    clearType: 'filtered' as 'all' | 'filtered',
  });

  try {
    await ElMessageBox({
      title: '清空数据',
      message: h(ClearMessage, {
        value: state.clearType,
        filteredRowsTotal: data.value?.total || 0,
        onUpdate: val => {
          state.clearType = val as 'all' | 'filtered';
        },
      }),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    const resp = await clearAnchorCommentTemplateGroup({
      org_id: globalStore.orgId,
      filter:
        state.clearType === 'all'
          ? undefined
          : transformFilterViewValuesToFilterValues(filters.value),
    });

    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message: `共清空 ${resp.data!.deleted_count} 个模板分组`,
      type: 'success',
      duration: 2000,
    });

    emits('deleteItems', resp.data!.deleted_ids);

    await refetch();
  } catch {}
}

onKeepAliveActivated(refetch);

const formDialogVisible = ref(false);
const formData = ref<AnchorCommentTemplateGroup>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: AnchorCommentTemplateGroup) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleCreateOrEdit(data: Partial<AnchorCommentTemplateGroup>) {
  let result:
    | CreateAnchorCommentTemplateGroupResponse
    | UpdateAnchorCommentTemplateGroupResponse;
  if (formMode.value === 'create') {
    result = await createAnchorCommentTemplateGroup({
      org_id: globalStore.orgId,
      name: data.name!,
    });
  } else {
    result = await updateAnchorCommentTemplateGroup({
      id: formData.value!.id,
      org_id: globalStore.orgId,
      name: data.name!,
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
  <div
    v-loading="isLoading || isRefreshing"
    class="comment-template-group-table"
  >
    <div v-if="isError" class="comment-template-group-table-error">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <AnchorCommentTemplateGroupFilter
          :model-value="filters"
          @change="handleFilterChange"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part">
          <ElButton size="small" type="primary" @click="onAddItem">
            添加模板组
          </ElButton>
        </div>
        <div class="right-part">
          <ElButton
            :disabled="!hasSelectedRows"
            type="danger"
            size="small"
            @click="handleBatchDelete"
          >
            批量删除
          </ElButton>
          <ElButton type="danger" size="small" @click="handleClearData">
            清空数据
          </ElButton>
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
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <!-- <ElTableColumn prop="id" label="分组ID" min-width="120" /> -->
        <ElTableColumn prop="name" label="分组名称" min-width="140" />
        <ElTableColumn
          prop="templates_count"
          label="模板数量"
          min-width="140"
          sortable="custom"
        />

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

        <ElTableColumn fixed="right" label="操作" min-width="180">
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
                type="primary"
                size="small"
                @click.prevent="onTemplateGroupManage(scope.row)"
              >
                模板组管理
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
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </template>
  </div>
  <TemplateGroupFormDialog
    :visible="formDialogVisible"
    :mode="formMode"
    :initial-data="formData"
    :submit="handleCreateOrEdit"
    @close="onCloseFormDialog"
  />
</template>

<style scoped>
.comment-template-group-table {
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

.comment-template-group-table-error {
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
