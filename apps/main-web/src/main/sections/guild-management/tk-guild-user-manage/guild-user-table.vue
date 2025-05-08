<script setup lang="tsx">
import type {
  Area,
  CreateTKGuildUserRequest,
  CreateTKGuildUserResponse,
  GetTKGuildUserListResponseData,
  TKGuildUser,
  UpdateTKGuildUserResponse,
} from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
// import { InfoFilled } from '@element-plus/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import {
  AREA_NAME_MAP,
  TIKTOK_LIVE_ADMIN_URL,
  TKGuildUserStatus,
  VALID_GUILD_USER_STATUS_LIST,
} from '@tk-crawler/biz-shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import {
  CUSTOM_EVENTS,
  MAIN_APP_ID,
  MAIN_APP_PRODUCT_NAME,
  MAIN_APP_PUBLISH_URL,
} from '@tk-crawler/main-client-shared';
import { formatDateTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  AreaTooltipIcon,
  getPlatform,
  isDesktopPlatform,
  onKeepAliveActivated,
  RefreshButton,
  useIsWebSize,
} from '@tk-crawler/view-shared';
import {
  ElButton,
  ElLink,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTooltip,
} from 'element-plus';
import { computed, ref, toRaw } from 'vue';
import { VisiblePassword } from '../../../components';
import {
  createTKGuildUser,
  deleteTKGuildUser,
  getTKGuildUserList,
  stopTKGuildUserAccount,
  updateTKGuildUser,
} from '../../../requests';
import { useGlobalStore } from '../../../utils/vue';
import {
  DefaultFilterViewValues,
  type FilterViewValues,
  transformFilterViewValuesToFilterValues,
} from './filter';
import TKGuildUserFilter from './guild-user-filter.vue';
import FormDialog from './guild-user-form-dialog.vue';
import StatusTag from './status-tag.vue';

defineOptions({
  name: 'TKGuildUserTable',
});

type TKGuildUserRow = GetTKGuildUserListResponseData['list'][number];

interface ScopeType {
  row: TKGuildUserRow;
  column: TableColumnCtx<TKGuildUserRow>;
  $index: number;
}

const globalStore = useGlobalStore();
const isWeb = useIsWebSize();

const tableRef = ref<InstanceType<typeof ElTable>>();
const pageNum = ref(1);
const pageSize = ref(20);
const sortField = ref<keyof TKGuildUser>();
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

const { data, isFetching, refetch } = useQuery<
  GetTKGuildUserListResponseData | undefined
>({
  queryKey: [
    'tk-guild-users',
    globalStore.token,
    pageNum,
    pageSize,
    sortField,
    sortOrder,
    filters,
  ],
  retry: false,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const orderBy = sortField.value
      ? { [sortField.value]: sortOrder.value === 'ascending' ? 'asc' : 'desc' }
      : undefined;
    const response = await getTKGuildUserList(
      {
        page_num: pageNum.value,
        page_size: pageSize.value,
        order_by: orderBy,
        filter: transformFilterViewValuesToFilterValues(filters.value),
      },
      globalStore.token,
    );
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
    // return {
    //   list: new Array(pageSize.value).fill(0).map((_, index) => ({
    //     ...response.data?.list![0],
    //     username: `用户${index}`,
    //     id: index.toString(),
    //   })),
    //   total: 200,
    // };
  },
  placeholderData: previousData => previousData,
});

// 处理排序变化
function handleSortChange({
  prop,
  order,
}: {
  prop: keyof TKGuildUser;
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

// 删除用户
async function deleteUser(user: TKGuildUserRow) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  const response = await deleteTKGuildUser(
    { ids: [user.id] },
    globalStore.token,
  );

  if (response.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success({ message: '删除成功', type: 'success', duration: 2000 });
    await refetch();
  } else {
    ElMessage.error({
      message: response.message || '删除失败',
      type: 'error',
      duration: 2000,
    });
  }
}

function handlePageNumChange(_pageNum: number) {
  pageNum.value = _pageNum;
}

function handlePageSizeChange(_pageSize: number) {
  pageSize.value = _pageSize;
}

const selectedRows = ref<TKGuildUser[]>([]);

// 处理选择变化
function handleSelectionChange(rows: TKGuildUser[]) {
  selectedRows.value = rows;
}
const hasSelectedRows = computed(() => selectedRows.value.length > 0);

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${selectedRows.value.length} 个主播吗？`,
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    );
  } catch {
    return;
  }

  const response = await deleteTKGuildUser(
    { ids: selectedRows.value.map(user => user.id) },
    globalStore.token,
  );

  if (response.status_code === RESPONSE_CODE.SUCCESS) {
    ElMessage.success({
      message: `共删除 ${response.data?.deleted_count} 个用户`,
      type: 'success',
      duration: 2000,
    });
    await refetch();
  } else {
    ElMessage.error({
      message: response.message || '删除失败',
      type: 'error',
      duration: 2000,
    });
  }
}

const formDialogVisible = ref(false);
const formData = ref<Partial<TKGuildUser>>();
const formMode = ref<'create' | 'edit'>('create');

function onAddItem() {
  formData.value = undefined;
  formMode.value = 'create';
  formDialogVisible.value = true;
}
function onEditItem(item: TKGuildUserRow) {
  formData.value = item;
  formMode.value = 'edit';
  formDialogVisible.value = true;
}
function onCloseFormDialog() {
  formDialogVisible.value = false;
  formData.value = undefined;
  formMode.value = 'create';
}
async function handleSubmitCreateOrEdit(data: Partial<TKGuildUser>) {
  let result: CreateTKGuildUserResponse | UpdateTKGuildUserResponse;
  const org_id = globalStore.userProfile.orgInfo!.id;
  if (formMode.value === 'create') {
    result = await createTKGuildUser(
      {
        ...data,
        org_id,
      } as CreateTKGuildUserRequest,
      globalStore.token,
    );
  } else {
    result = await updateTKGuildUser(
      {
        data: { id: formData.value!.id!, org_id, ...data },
      },
      globalStore.token,
    );
  }
  if (result.status_code !== RESPONSE_CODE.SUCCESS) {
    return;
  }
  await refetch();
  onCloseFormDialog();
  ElMessage.success('保存成功');
}

function getStartOrStopButtonText(status: TKGuildUserStatus) {
  if (VALID_GUILD_USER_STATUS_LIST.includes(status)) {
    return '停止查询';
  }
  if (
    status === TKGuildUserStatus.ERROR ||
    status === TKGuildUserStatus.COOKIE_EXPIRED
  ) {
    return '点击重新启动';
  }
  return '点击启动查询';
}

function getStartOrStopType(status: TKGuildUserStatus): 'stop' | 'start' {
  if (VALID_GUILD_USER_STATUS_LIST.includes(status)) {
    return 'stop';
  }
  return 'start';
}

async function onStartOrStop(item: TKGuildUserRow) {
  const type = getStartOrStopType(item.status);
  if (type === 'stop') {
    try {
      await ElMessageBox.confirm('确定要停止查询吗？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      });
    } catch {
      return;
    }
    const result = await stopTKGuildUserAccount(
      { user_id: item.id },
      globalStore.token,
    );
    if (result.status_code !== RESPONSE_CODE.SUCCESS) {
      return;
    }
    await refetch();
    ElMessage.success('成功停止');
  } else {
    if (!isInElectronApp()) {
      if (!isDesktopPlatform()) {
        ElMessage.warning('手机端无法支持此操作，请在桌面客户端中尝试');
        return;
      }
      try {
        const platform = getPlatform();
        await ElMessageBox({
          title: '提示',
          message: (
            <div>
              <div
                style={{
                  width: '100%',
                }}
              >
                浏览器环境无法支持此功能，请在
                <span
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  {`「${MAIN_APP_PRODUCT_NAME}」`}
                </span>
                中尝试。
              </div>
              <div
                style={{
                  width: '100%',
                }}
              >
                如果你尚未安装应用，请前往
                <ElLink
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'baseline',
                    marginRight: '0.5rem',
                    marginLeft: '0.5rem',
                  }}
                  href={
                    platform === 'Mac'
                      ? `${MAIN_APP_PUBLISH_URL}/${MAIN_APP_PRODUCT_NAME}-Mac-Installer.dmg`
                      : `${MAIN_APP_PUBLISH_URL}/${MAIN_APP_PRODUCT_NAME}-Windows-Installer.exe`
                  }
                  target="_blank"
                  type="primary"
                  underline
                >
                  下载页面
                </ElLink>
                安装。
              </div>
            </div>
          ),
          type: 'warning',
          confirmButtonText: '尝试打开客户端',
        });
        window.open(`${MAIN_APP_ID}://`);
      } catch {}
      return;
    }
    if (!globalStore.userProfile.hasMembership) {
      ElMessage.warning('您没有权限进行修改，请先开通会员');
      return;
    }
    await window.ipcRenderer.invoke(CUSTOM_EVENTS.GO_TO_GUILD_COOKIE_PAGE, {
      guildUser: toRaw(item),
    });
  }
}

onKeepAliveActivated(refetch);
</script>

<template>
  <div v-loading="isFetching" class="tk-guild-user-table">
    <!-- <div v-if="isError" class="error-msg">
      {{ error?.message }}
    </div> -->
    <div class="filter-row">
      <TKGuildUserFilter
        :model-value="filters"
        :areas="globalStore.userProfile.orgInfo?.areas ?? []"
        @change="handleFilterChange"
        @reset="handleFilterReset"
      />
    </div>
    <div class="header-row">
      <div class="left-part">
        <ElTooltip
          popper-style="max-width: 320px;"
          placement="top"
          effect="dark"
        >
          <template #content>
            <span>
              请添加
              <ElLink
                type="primary"
                style="vertical-align: baseline"
                :href="TIKTOK_LIVE_ADMIN_URL"
                target="_blank"
                >{{ TIKTOK_LIVE_ADMIN_URL }}</ElLink
              >
              网站的账号。添加查询账号越多，查询速度越快
            </span>
          </template>
          <ElButton type="primary" size="small" @click="onAddItem">
            添加账号
            <!-- <ElIcon style="font-size: 14px; margin-left: 0.25rem">
                <InfoFilled />
              </ElIcon> -->
          </ElButton>
        </ElTooltip>
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
      @selection-change="handleSelectionChange"
    >
      <ElTableColumn type="selection" width="30" />
      <ElTableColumn
        prop="username"
        label="后台查询账号"
        :fixed="isWeb ? undefined : 'left'"
        :min-width="isWeb ? 200 : 140"
      />
      <ElTableColumn label="启动/停止" :min-width="isWeb ? 120 : 100">
        <template #default="scope: ScopeType">
          <ElButton
            class="start-or-stop-button"
            size="small"
            :type="
              getStartOrStopType(scope.row.status) === 'stop'
                ? 'danger'
                : 'success'
            "
            @click="onStartOrStop(scope.row)"
          >
            {{ getStartOrStopButtonText(scope.row.status) }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="status"
        label="状态"
        min-width="128"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          <StatusTag :status="scope.row.status" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="password"
        label="后台查询密码"
        :min-width="isWeb ? 140 : 100"
      >
        <template #default="scope: ScopeType">
          <VisiblePassword :password="scope.row.password" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="area"
        label="分区"
        sortable="custom"
        :min-width="isWeb ? 140 : 100"
      >
        <template #default="scope: ScopeType">
          <div class="area-with-tooltip">
            {{ AREA_NAME_MAP[scope.row.area as Area] || '-' }}
            <AreaTooltipIcon :area="scope.row.area as Area" />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="max_query_per_day"
        label="每天最大查询次数"
        :min-width="isWeb ? 160 : 140"
        sortable="custom"
      />
      <ElTableColumn
        prop="max_query_per_hour"
        label="每小时最大查询次数"
        :min-width="isWeb ? 180 : 150"
        sortable="custom"
      />
      <ElTableColumn
        prop="current_query_per_day"
        label="当天查询次数"
        :min-width="isWeb ? 160 : 120"
      />
      <ElTableColumn
        prop="current_query_per_hour"
        label="当前小时查询次数"
        :min-width="isWeb ? 180 : 140"
      />
      <ElTableColumn
        prop="created_at"
        label="创建时间"
        :min-width="isWeb ? 205 : 160"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.created_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="updated_at"
        label="更新时间"
        min-width="205"
        sortable="custom"
      >
        <template #default="scope: ScopeType">
          {{ formatDateTime(scope.row.updated_at) }}
        </template>
      </ElTableColumn>
      <!-- <ElTableColumn prop="cookie" label="Cookie" min-width="200">
          <template #default="scope: ScopeType">
            <div v-if="scope.row.cookie" class="cookie">
              <span class="cookie-text">{{ scope.row.cookie }}</span>
              <CopyIcon tooltip="复制Cookie" :copy-content="scope.row.cookie" />
            </div>
          </template>
        </ElTableColumn> -->
      <ElTableColumn
        label="操作"
        min-width="140"
        :fixed="isWeb ? 'right' : false"
      >
        <template #default="scope: ScopeType">
          <div class="operation-buttons">
            <ElButton
              size="small"
              type="primary"
              @click="onEditItem(scope.row)"
            >
              编辑
            </ElButton>
            <ElButton size="small" type="danger" @click="deleteUser(scope.row)">
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
        :page-sizes="[10, 20, 50, 100]"
        :pager-count="isWeb ? 7 : 3"
        :total="data?.total || 0"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNumChange"
      />
    </div>

    <!-- 创建用户对话框 -->
    <FormDialog
      :visible="formDialogVisible"
      :mode="formMode"
      :initial-data="formData"
      :submit="handleSubmitCreateOrEdit"
      @close="onCloseFormDialog"
    />
  </div>
</template>

<style lang="scss" scoped>
.tk-guild-user-table {
  position: relative;
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  @include mobile {
    padding: 1rem;
  }
  @include web {
    padding: 2rem 1rem;
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
  .error-msg {
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
  .cookie {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    column-gap: 0.25rem;
    .cookie-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .area-with-tooltip {
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
  .start-or-stop-button {
    width: 100%;
  }
}
</style>
