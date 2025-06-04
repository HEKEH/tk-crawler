<script setup lang="ts">
import type {
  AnchorCommentTemplate,
  CreateAnchorCommentTemplateResponse,
  GetAnchorCommentTemplateListResponseData,
  UpdateAnchorCommentTemplateResponse,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import { useQuery } from '@tanstack/vue-query';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  ClearMessage,
  onKeepAliveActivated,
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
} from 'element-plus';
import { computed, h, reactive, ref, watch } from 'vue';
import {
  clearAnchorCommentTemplate,
  createAnchorCommentTemplate,
  deleteAnchorCommentTemplate,
  getAnchorCommentTemplateList,
  updateAnchorCommentTemplate,
} from '../../../../requests';
import { useGlobalStore } from '../../../../utils/vue';
import AnchorCommentTemplateFilter from './anchor-comment-template-filter.vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TemplateFormDialog from './template-form-dialog.vue';

defineOptions({
  name: 'AnchorCommentTemplateTable',
});

const props = defineProps<{
  templateGroupId: string;
}>();

const emits = defineEmits<{
  (e: 'deleteItems', templateIds: string[]): void;
}>();

interface ScopeType {
  row: AnchorCommentTemplate;
  column: TableColumnCtx<AnchorCommentTemplate>;
  $index: number;
}

const isWebSize = useIsWebSize();
const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const sortField = ref<keyof AnchorCommentTemplate>();
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

// 监听模板分组ID变化，重置页码和过滤条件
watch(
  () => props.templateGroupId,
  () => {
    pageNum.value = 1;
    filters.value = DefaultFilterViewValues;
  },
);

const { data, isFetching, isError, refetch } = useQuery<
  GetAnchorCommentTemplateListResponseData | undefined
>({
  queryKey: [
    'anchor-comment-templates',
    token,
    props.templateGroupId,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
    filters,
  ],
  retry: false,
  // refetchOnWindowFocus: false,
  queryFn: async () => {
    if (!token.value) {
      return {
        list: [],
        total: 0,
      };
    }
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getAnchorCommentTemplateList(
      {
        page_num: pageNum.value,
        page_size: pageSize.value,
        order_by: orderBy,
        filter: {
          ...transformFilterViewValuesToFilterValues(filters.value),
          group_id: BigInt(props.templateGroupId),
        },
      },
      token.value,
    );
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
  },
  placeholderData: previousData => previousData,
  enabled: !!props.templateGroupId,
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof AnchorCommentTemplate;
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
// const isRefreshing = ref(false);
async function refresh() {
  // isRefreshing.value = true;
  return refetch().finally(() => {
    // isRefreshing.value = false;
  });
}

// 删除模板
async function deleteItem(item: AnchorCommentTemplate) {
  try {
    await ElMessageBox.confirm(`确定要删除模板吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await deleteAnchorCommentTemplate(
    {
      ids: [item.id],
    },
    token.value,
  );
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

const selectedRows = ref<AnchorCommentTemplate[]>([]);

// 处理选择变化
function handleSelectionChange(rows: AnchorCommentTemplate[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${selectedRows.value.length} 个模板吗？`,
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
  const { data, status_code } = await deleteAnchorCommentTemplate(
    {
      ids: itemsIds,
    },
    token.value,
  );
  if (status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }

  ElMessage.success({
    message: `共删除 ${data!.deleted_count} 个模板`,
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

    const resp = await clearAnchorCommentTemplate(
      {
        filter: {
          ...(state.clearType === 'all'
            ? undefined
            : transformFilterViewValuesToFilterValues(filters.value)),
          group_id: BigInt(props.templateGroupId),
        },
      },
      token.value,
    );

    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message: `共清空 ${resp.data!.deleted_count} 个模板`,
      type: 'success',
      duration: 2000,
    });

    await refetch();
  } catch {}
}

onKeepAliveActivated(refetch);

const formDialogVisible = ref(false);
const formData = ref<AnchorCommentTemplate>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: AnchorCommentTemplate) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleCreateOrEdit(data: Partial<AnchorCommentTemplate>) {
  let result:
    | CreateAnchorCommentTemplateResponse
    | UpdateAnchorCommentTemplateResponse;
  if (formMode.value === 'create') {
    result = await createAnchorCommentTemplate(
      {
        group_id: props.templateGroupId,
        templates: [
          {
            content: data.content!,
            label: data.label || null,
          },
        ],
      },
      token.value,
    );
  } else {
    result = await updateAnchorCommentTemplate(
      {
        template: {
          id: formData.value!.id,
          content: data.content!,
          label: data.label || null,
        },
      },
      token.value,
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
  <div v-loading="isFetching" class="comment-template-table">
    <!-- <div v-if="isError" class="comment-template-table-error">
      {{ error?.message }}
    </div> -->
    <template v-if="!isError">
      <div class="filter-row">
        <AnchorCommentTemplateFilter
          :model-value="filters"
          @change="handleFilterChange"
          @reset="handleFilterReset"
        >
          <template v-if="!isWebSize" #extra-buttons>
            <ElButton type="default" size="small" @click="resetSort">
              重置排序
            </ElButton>
            <RefreshButton @click="refresh" />
          </template>
        </AnchorCommentTemplateFilter>
      </div>
      <div class="header-row">
        <div class="left-part">
          <ElButton size="small" type="primary" @click="onAddItem">
            添加模板
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
          <template v-if="isWebSize">
            <ElButton type="default" size="small" @click="resetSort">
              重置排序
            </ElButton>
            <RefreshButton @click="refresh" />
          </template>
        </div>
      </div>
      <ElTable
        ref="tableRef"
        :size="isWebSize ? 'default' : 'small'"
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
        <ElTableColumn type="selection" :width="isWebSize ? 55 : 30" />
        <ElTableColumn
          prop="label"
          label="标题"
          :min-width="isWebSize ? 140 : 100"
        />
        <ElTableColumn
          prop="content"
          label="内容"
          :min-width="isWebSize ? 260 : 200"
          show-overflow-tooltip
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

        <ElTableColumn
          :fixed="isWebSize ? 'right' : undefined"
          label="操作"
          min-width="120"
        >
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
          :pager-count="isWebSize ? 7 : 3"
          :total="data?.total || 0"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </template>
  </div>
  <TemplateFormDialog
    :visible="formDialogVisible"
    :mode="formMode"
    :initial-data="formData"
    :submit="handleCreateOrEdit"
    @close="onCloseFormDialog"
  />
</template>

<style lang="scss" scoped>
.comment-template-table {
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  @include web {
    padding: 2rem 1rem;
  }
  @include mobile {
    padding: 1rem;
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
