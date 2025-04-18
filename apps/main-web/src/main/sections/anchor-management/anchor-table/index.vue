<script setup lang="tsx">
import type {
  Area,
  DisplayedAnchorItem,
  GetAnchorListOrderBy,
  Region,
} from '@tk-crawler/biz-shared';
import {
  AREA_NAME_MAP,
  CanUseInvitationType,
  REGION_LABEL_MAP,
  TIKTOK_URL,
} from '@tk-crawler/biz-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  AreaTooltipIcon,
  ClearMessage,
  confirmAfterSeconds,
  CopyIcon,
  RefreshButton,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElLink,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { computed, h, onActivated, reactive, ref } from 'vue';
import { useGetAnchorList } from '../../../hooks';
import { clearAnchorCheck } from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import {
  type FilterViewValues,
  getDefaultFilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TKAnchorFilter from './filter.vue';

defineOptions({
  name: 'TKAnchorTable',
});

const globalStore = useGlobalStore();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const sortField = ref<keyof DisplayedAnchorItem>();
const sortOrder = ref<'ascending' | 'descending'>();
const queryOrderBy = computed<GetAnchorListOrderBy | undefined>(() => {
  return sortField.value
    ? ({
        [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc',
      } as GetAnchorListOrderBy)
    : undefined;
});

const defaultFilterViewValues = computed(() =>
  getDefaultFilterViewValues(globalStore.userProfile.orgInfo!.areas[0]),
);

// 过滤条件
const filters = ref<FilterViewValues>(defaultFilterViewValues.value);

// 处理过滤器变化
function handleFilterSubmit(_filters: FilterViewValues) {
  filters.value = _filters;
  pageNum.value = 1; // 重置页码
}

function handleFilterReset() {
  filters.value = defaultFilterViewValues.value;
  pageNum.value = 1; // 重置页码
}

const queryFilter = computed(() => {
  return transformFilterViewValuesToFilterValues(filters.value);
});

const { data, isLoading, isError, error, refetch } = useGetAnchorList(
  {
    pageNum,
    pageSize,
    filter: queryFilter,
    orderBy: queryOrderBy,
  },
  globalStore.token,
);

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof DisplayedAnchorItem;
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

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<DisplayedAnchorItem[]>([]);

// 处理选择变化
function handleSelectionChange(rows: DisplayedAnchorItem[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

async function handleClearAnchorCheck() {
  const state = reactive({
    clearType: 'all' as 'all' | 'filtered',
  });

  try {
    await confirmAfterSeconds(
      h(ClearMessage, {
        value: state.clearType,
        filteredRowsTotal: data.value?.total || 0,
        onUpdate: val => {
          state.clearType = val as 'all' | 'filtered';
        },
      }),
      2,
      {
        title: '一键清空',
        type: undefined,
        showCancelButton: true,
      },
    );

    const resp = await clearAnchorCheck(globalStore.token, {
      filter: state.clearType === 'all' ? undefined : queryFilter.value,
    });

    if (resp.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }

    ElMessage.success({
      message: `共清空 ${resp.data!.deleted_count} 条数据`,
      type: 'success',
      duration: 2000,
    });

    await refetch();
  } catch {}
}

onActivated(refetch);
</script>

<template>
  <div v-loading="isLoading || isRefreshing" class="tk-guild-user-table">
    <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div>
    <template v-if="!isError">
      <div class="filter-row">
        <TKAnchorFilter
          :model-value="filters"
          :areas="globalStore.userProfile.orgInfo!.areas"
          @submit="handleFilterSubmit"
          @reset="handleFilterReset"
        />
      </div>
      <div class="header-row">
        <div class="left-part">
          <ElButton :disabled="!hasSelectedRows" type="primary" size="small">
            批量分配(TODO)
          </ElButton>
        </div>
        <div class="right-part">
          <ElButton
            v-if="globalStore.userProfile.isAdmin"
            type="danger"
            size="small"
            @click="handleClearAnchorCheck"
          >
            一键清空
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
        row-key="user_id"
        @sort-change="handleSortChange"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <!-- 基本信息 -->
        <ElTableColumn
          prop="display_id"
          label="主播ID"
          width="160"
          sortable="custom"
        >
          <template #default="scope">
            <div class="display-id-container">
              <ElLink
                type="primary"
                class="display-id-link"
                :href="`${TIKTOK_URL}/@${scope.row.display_id}`"
                target="_blank"
              >
                {{ scope.row.display_id }}
              </ElLink>
              <CopyIcon
                tooltip="复制主播ID"
                :copy-content="scope.row.display_id"
              />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="user_id"
          label="数字ID"
          width="210"
          sortable="custom"
        >
          <template #default="scope">
            <div class="user-id-container">
              <span class="user-id-text">{{ scope.row.user_id }}</span>
              <CopyIcon
                tooltip="复制数字ID"
                :copy-content="scope.row.user_id"
              />
            </div>
          </template>
        </ElTableColumn>
        <!-- 数据统计 -->
        <ElTableColumn
          prop="follower_count"
          label="粉丝数"
          min-width="120"
          sortable="custom"
        />
        <ElTableColumn
          prop="audience_count"
          label="直播间观众数"
          min-width="140"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.audience_count ?? '-' }}
          </template>
        </ElTableColumn>

        <!-- 钻石相关 -->
        <ElTableColumn
          prop="current_diamonds"
          label="当前钻石"
          min-width="120"
          sortable="custom"
        />
        <ElTableColumn
          prop="last_diamonds"
          label="上次钻石"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.last_diamonds ?? '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="highest_diamonds"
          label="最高钻石"
          min-width="120"
          sortable="custom"
        />

        <!-- 等级与区域 -->
        <ElTableColumn
          prop="rank_league"
          label="直播段位"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.rank_league ?? '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="area"
          label="主播分区"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            <div class="area-with-tooltip">
              {{ AREA_NAME_MAP[scope.row.area as Area] || '-' }}
              <AreaTooltipIcon :area="scope.row.area as Area" />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="region"
          label="国家或地区"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{
              REGION_LABEL_MAP[scope.row.region as Region]
                ? `${REGION_LABEL_MAP[scope.row.region as Region]} (${scope.row.region})`
                : scope.row.region
            }}
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="checked_result"
          label="可邀约"
          min-width="100"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.checked_result ? '是' : '否' }}
          </template>
        </ElTableColumn>

        <!-- 邀约相关 -->
        <ElTableColumn
          prop="invite_type"
          label="邀约类型"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            <ElTag
              v-if="scope.row.invite_type === CanUseInvitationType.Elite"
              type="warning"
            >
              金票邀约
            </ElTag>
            <ElTag
              v-else-if="scope.row.invite_type === CanUseInvitationType.Regular"
              type="success"
            >
              常规邀约
            </ElTag>
            <span v-else> - </span>
          </template>
        </ElTableColumn>

        <!-- 其他信息 -->
        <ElTableColumn
          prop="has_commerce_goods"
          label="带货主播"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.has_commerce_goods ? '是' : '否' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="tag"
          label="直播标签"
          min-width="120"
          sortable="custom"
        >
          <template #default="scope">
            {{ scope.row.tag || '-' }}
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="room_id"
          label="直播间ID"
          min-width="180"
          sortable="custom"
        />

        <!-- 时间信息 -->
        <ElTableColumn
          prop="checked_at"
          label="最新时间"
          min-width="190"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.checked_at) }}
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
          :page-sizes="[10, 20, 50, 100]"
          :total="data?.total || 0"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.tk-guild-user-table {
  padding: 2rem 1rem;
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .filter-row {
    width: 100%;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
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
  .error-msg {
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
  .cookie {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    .cookie-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .copy-icon {
      cursor: pointer;
      margin-left: 0.5rem;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
  .area-with-tooltip {
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
  .display-id-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 100%;
    column-gap: 0.5rem;
    overflow: hidden;
    .display-id-link {
      flex: 0 1 auto;
      overflow: hidden;
      color: var(--el-color-primary-dark-2);
      :global(.el-link__inner) {
        display: inline-block;
        width: 100%;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .user-id-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 0.5rem;
    max-width: 100%;
    overflow: hidden;
    .user-id-text {
      flex: 0 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
