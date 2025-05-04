import type { Area, DisplayedAnchorItem, Region } from '@tk-crawler/biz-shared';
import type { Column } from 'element-plus';
import type { ComputedRef, Ref } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import {
  AREA_NAME_MAP,
  CanUseInvitationType,
  REGION_LABEL_MAP,
  TIKTOK_URL,
} from '@tk-crawler/biz-shared';
import { formatDateTime, getColorFromName } from '@tk-crawler/shared';
import {
  AreaTooltipIcon,
  CopyIcon,
  useIsWebSize,
} from '@tk-crawler/view-shared';
import { ElIcon, ElLink, ElTag, ElTooltip } from 'element-plus';
import { computed } from 'vue';
import './anchor-table-columns.scss';

export interface CustomColumnConfig extends Column<DisplayedAnchorItem> {
  customPosition?: {
    isFirst?: boolean;
    isLast?: boolean;
    before?: string;
    after?: string;
  };
}

export default function useAnchorTableColumns(props: {
  hiddenColumns?: string[];
  customColumns?: Ref<CustomColumnConfig[]> | ComputedRef<CustomColumnConfig[]>;
}) {
  const isWeb = useIsWebSize();

  const baseColumns = computed<Column<DisplayedAnchorItem>[]>(() => {
    return [
      {
        key: 'display_id',
        title: '主播展示ID',
        width: isWeb.value ? 160 : 140,
        sortable: true,
        fixed: true,
        cellRenderer: ({ rowData }) => (
          <div class="display-id-container">
            <ElLink
              type="primary"
              class="display-id-link"
              href={`${TIKTOK_URL}/@${rowData.display_id}`}
              target="_blank"
            >
              {rowData.display_id}
            </ElLink>
            <CopyIcon
              tooltip="复制主播展示ID"
              copyContent={rowData.display_id}
            />
          </div>
        ),
      },
      {
        key: 'contacted_by',
        title: '建联状态',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) =>
          !rowData.contacted_user ? (
            <ElTag class="org-user-tag" type="info">
              未建联
            </ElTag>
          ) : (
            <ElTag
              type="success"
              class="org-user-tag"
              style={{
                color: getColorFromName(rowData.contacted_user.display_name),
              }}
            >
              {rowData.contacted_user.display_name}
            </ElTag>
          ),
      },
      {
        key: 'assign_to',
        title: '分配状态',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) =>
          !rowData.assigned_user ? (
            <ElTag class="org-user-tag" type="info">
              未分配
            </ElTag>
          ) : (
            <ElTag
              type="success"
              class="org-user-tag"
              style={{
                color: getColorFromName(rowData.assigned_user.display_name),
              }}
            >
              {rowData.assigned_user.display_name}
            </ElTag>
          ),
      },
      {
        key: 'user_id',
        title: '主播ID',
        width: isWeb.value ? 210 : 160,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <div class="number-id-container">
            <span class="number-id-text">{rowData.user_id}</span>
            <CopyIcon tooltip="复制主播ID" copyContent={rowData.user_id} />
          </div>
        ),
      },
      {
        key: 'area',
        title: '主播分区',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <div class="area-with-tooltip">
            {AREA_NAME_MAP[rowData.area as Area] || '-'}
            <AreaTooltipIcon area={rowData.area as Area} />
          </div>
        ),
      },
      {
        key: 'region',
        title: '国家或地区',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>
            {REGION_LABEL_MAP[rowData.region as Region]
              ? `${REGION_LABEL_MAP[rowData.region as Region]} (${rowData.region})`
              : rowData.region}
          </span>
        ),
      },
      {
        key: 'checked_result',
        title: '可邀约',
        width: isWeb.value ? 100 : 80,
        sortable: true,
        cellRenderer: ({ rowData }) =>
          rowData.checked_result ? (
            <ElTag type="success">是</ElTag>
          ) : (
            <ElTag type="danger">否</ElTag>
          ),
      },
      {
        key: 'invite_type',
        title: '邀约方式',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) =>
          rowData.invite_type === CanUseInvitationType.Elite ? (
            <ElTag type="warning">金票邀约</ElTag>
          ) : rowData.invite_type === CanUseInvitationType.Regular ? (
            <ElTag type="success">常规邀约</ElTag>
          ) : (
            <span>-</span>
          ),
      },
      {
        key: 'follower_count',
        title: '粉丝数',
        width: isWeb.value ? 120 : 90,
        sortable: true,
      },
      {
        key: 'audience_count',
        title: '直播间观众数',
        width: isWeb.value ? 140 : 120,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>{rowData.audience_count ?? '-'}</span>
        ),
      },
      {
        key: 'current_diamonds',
        title: '当前钻石',
        width: isWeb.value ? 120 : 100,
        sortable: true,
      },
      {
        key: 'last_diamonds',
        title: '上次钻石',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>{rowData.last_diamonds ?? '-'}</span>
        ),
      },
      {
        key: 'highest_diamonds',
        title: '最高钻石',
        width: isWeb.value ? 120 : 100,
        sortable: true,
      },
      {
        key: 'rank_league',
        title: '直播段位',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>{rowData.rank_league ?? '-'}</span>
        ),
      },
      {
        key: 'has_commerce_goods',
        title: '带货主播',
        width: isWeb.value ? 120 : 100,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>{rowData.has_commerce_goods ? '是' : '否'}</span>
        ),
      },
      {
        key: 'tag',
        title: '直播标签',
        width: isWeb.value ? 140 : 120,
        sortable: true,
        cellRenderer: ({ rowData }) => <span>{rowData.tag || '-'}</span>,
      },
      {
        key: 'crawled_at',
        title: '最新时间',
        width: isWeb.value ? 200 : 180,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>{formatDateTime(rowData.crawled_at)}</span>
        ),
        headerCellRenderer: () => (
          <span class="column-header-label">
            最新时间
            <ElTooltip
              placement="top"
              v-slots={{
                content: () => <div>爬虫最新采集主播直播间信息的时间</div>,
              }}
            >
              <ElIcon>
                <InfoFilled />
              </ElIcon>
            </ElTooltip>
          </span>
        ),
      },
      {
        key: 'checked_at',
        title: '邀约检测时间',
        width: isWeb.value ? 200 : 180,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <span>{formatDateTime(rowData.checked_at)}</span>
        ),
        headerCellRenderer: () => (
          <span class="column-header-label">
            邀约检测时间
            <ElTooltip
              placement="top"
              v-slots={{
                content: () => (
                  <>
                    <div>使用TK公会账号检测主播可邀约状态的时间</div>
                    <div>注：7天内不会重复检测（账号检测次数有限）</div>
                  </>
                ),
              }}
            >
              <ElIcon>
                <InfoFilled />
              </ElIcon>
            </ElTooltip>
          </span>
        ),
      },
      {
        key: 'room_id',
        title: '直播间ID',
        width: isWeb.value ? 210 : 160,
        sortable: true,
        cellRenderer: ({ rowData }) => (
          <div class="number-id-container">
            <span class="number-id-text">
              {rowData.room_id && rowData.room_id !== '0'
                ? rowData.room_id
                : '-'}
            </span>
            <CopyIcon tooltip="复制直播间ID" copyContent={rowData.room_id} />
          </div>
        ),
      },
    ];
  });

  const columns = computed(() => {
    if (!props.customColumns?.value?.length) {
      return baseColumns.value.filter(
        c => !props.hiddenColumns?.includes(c.key as string),
      );
    }
    let newColumns = [...baseColumns.value];
    const firstColumns: Column<DisplayedAnchorItem>[] = [];
    const lastColumns: Column<DisplayedAnchorItem>[] = [];
    props.customColumns?.value.forEach(column => {
      if (column.customPosition?.isFirst) {
        firstColumns.push(column);
      } else if (column.customPosition?.isLast) {
        lastColumns.push(column);
      } else if (column.customPosition?.before) {
        const index = newColumns.findIndex(
          c => c.key === column.customPosition!.before,
        );
        if (index !== -1) {
          newColumns.splice(index, 0, column);
        } else {
          throw new Error(`Column ${String(column.before)} not found`);
        }
      } else if (column.customPosition?.after) {
        const index = newColumns.findIndex(
          c => c.key === column.customPosition!.after,
        );
        if (index !== -1) {
          newColumns.splice(index + 1, 0, column);
        } else {
          throw new Error(`Column ${String(column.after)} not found`);
        }
      } else {
        newColumns.push(column);
      }
    });
    if (firstColumns.length) {
      newColumns = [...firstColumns, ...newColumns];
    }
    if (lastColumns.length) {
      newColumns = [...newColumns, ...lastColumns];
    }

    return newColumns.filter(
      c => !props.hiddenColumns?.includes(c.key as string),
    );
  });

  return columns;
}
