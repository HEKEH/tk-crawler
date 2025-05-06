import type { Area, DisplayedAnchorItem, Region } from '@tk-crawler/biz-shared';
import type { VirtualizedTableColumn } from '@tk-crawler/view-shared';
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

export interface CustomColumnConfig
  extends VirtualizedTableColumn<DisplayedAnchorItem> {
  customPosition?: {
    isFirst?: boolean;
    isLast?: boolean;
    before?: string;
    after?: string;
  };
}

interface CellComponentProps<T> {
  rowData: T;
}

// 展示ID单元格
function DisplayIdCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return (
    <div class="display-id-container">
      <ElLink
        type="primary"
        class="display-id-link"
        href={`${TIKTOK_URL}/@${props.rowData.display_id}`}
        target="_blank"
      >
        {props.rowData.display_id}
      </ElLink>
      <CopyIcon
        tooltip="复制主播展示ID"
        copyContent={props.rowData.display_id}
      />
    </div>
  );
}

// 建联人单元格
function ContactedByCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return !props.rowData.contacted_user ? (
    <ElTag class="org-user-tag" type="info">
      未建联
    </ElTag>
  ) : (
    <ElTag
      type="success"
      class="org-user-tag"
      style={{
        color: getColorFromName(props.rowData.contacted_user.display_name),
      }}
    >
      {props.rowData.contacted_user.display_name}
    </ElTag>
  );
}

// 分配人单元格
function AssignToCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return !props.rowData.assigned_user ? (
    <ElTag class="org-user-tag" type="info">
      未分配
    </ElTag>
  ) : (
    <ElTag
      type="success"
      class="org-user-tag"
      style={{
        color: getColorFromName(props.rowData.assigned_user.display_name),
      }}
    >
      {props.rowData.assigned_user.display_name}
    </ElTag>
  );
}

// 用户ID单元格
function UserIdCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return (
    <div class="number-id-container">
      <span class="number-id-text">{props.rowData.user_id}</span>
      <CopyIcon tooltip="复制主播ID" copyContent={props.rowData.user_id} />
    </div>
  );
}

// 地区单元格
function AreaCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return (
    <div class="area-with-tooltip">
      {AREA_NAME_MAP[props.rowData.area as Area] || '-'}
      <AreaTooltipIcon area={props.rowData.area as Area} />
    </div>
  );
}

// 区域单元格
function RegionCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return (
    <span>
      {REGION_LABEL_MAP[props.rowData.region as Region]
        ? `${REGION_LABEL_MAP[props.rowData.region as Region]} (${props.rowData.region})`
        : props.rowData.region}
    </span>
  );
}

// 检查结果单元格
function CheckedResultCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return props.rowData.checked_result ? (
    <ElTag type="success">是</ElTag>
  ) : (
    <ElTag type="danger">否</ElTag>
  );
}

// 邀约类型单元格
function InviteTypeCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return props.rowData.invite_type === CanUseInvitationType.Elite ? (
    <ElTag type="warning">金票邀约</ElTag>
  ) : props.rowData.invite_type === CanUseInvitationType.Regular ? (
    <ElTag type="success">常规邀约</ElTag>
  ) : (
    <span>-</span>
  );
}

// 观众数单元格
function AudienceCountCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return <span>{props.rowData.audience_count ?? '-'}</span>;
}

// 最后钻石数单元格
function LastDiamondsCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return <span>{props.rowData.last_diamonds ?? '-'}</span>;
}

// 排名联赛单元格
function RankLeagueCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return <span>{props.rowData.rank_league ?? '-'}</span>;
}

// 是否有商品单元格
function HasCommerceGoodsCellRenderer(
  props: CellComponentProps<DisplayedAnchorItem>,
) {
  return <span>{props.rowData.has_commerce_goods ? '是' : '否'}</span>;
}

// 标签单元格
function TagCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return <span>{props.rowData.tag || '-'}</span>;
}

// 爬取时间单元格
function CrawledAtCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return <span>{formatDateTime(props.rowData.crawled_at)}</span>;
}

// 检查时间单元格
function CheckedAtCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return <span>{formatDateTime(props.rowData.checked_at)}</span>;
}

// 房间ID单元格
function RoomIdCellRenderer(props: CellComponentProps<DisplayedAnchorItem>) {
  return (
    <div class="number-id-container">
      <span class="number-id-text">
        {props.rowData.room_id && props.rowData.room_id !== '0'
          ? props.rowData.room_id
          : '-'}
      </span>
      <CopyIcon tooltip="复制直播间ID" copyContent={props.rowData.room_id} />
    </div>
  );
}

export default function useAnchorTableColumns(props: {
  hiddenColumns?: string[];
  customColumns?: Ref<CustomColumnConfig[]> | ComputedRef<CustomColumnConfig[]>;
}) {
  const isWeb = useIsWebSize();

  const baseColumns = computed<VirtualizedTableColumn<DisplayedAnchorItem>[]>(
    () => {
      return [
        {
          key: 'display_id',
          title: '主播展示ID',
          width: isWeb.value ? 160 : 140,
          sortable: true,
          fixed: 'left',
          cellRenderer: DisplayIdCellRenderer,
        },
        {
          key: 'contacted_by',
          title: '建联状态',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          cellRenderer: ContactedByCellRenderer,
        },
        {
          key: 'assign_to',
          title: '分配状态',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          cellRenderer: AssignToCellRenderer,
        },
        {
          key: 'user_id',
          title: '主播ID',
          width: isWeb.value ? 210 : 160,
          sortable: true,
          cellRenderer: UserIdCellRenderer,
        },
        {
          key: 'area',
          title: '主播分区',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          cellRenderer: AreaCellRenderer,
        },
        {
          key: 'region',
          title: '国家或地区',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          cellRenderer: RegionCellRenderer,
        },
        {
          key: 'checked_result',
          title: '可邀约',
          width: isWeb.value ? 100 : 80,
          sortable: true,
          cellRenderer: CheckedResultCellRenderer,
        },
        {
          key: 'invite_type',
          title: '邀约方式',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          cellRenderer: InviteTypeCellRenderer,
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
          cellRenderer: AudienceCountCellRenderer,
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
          cellRenderer: LastDiamondsCellRenderer,
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
          cellRenderer: RankLeagueCellRenderer,
        },
        {
          key: 'has_commerce_goods',
          title: '带货主播',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          cellRenderer: HasCommerceGoodsCellRenderer,
        },
        {
          key: 'tag',
          title: '直播标签',
          width: isWeb.value ? 140 : 120,
          sortable: true,
          cellRenderer: TagCellRenderer,
        },
        {
          key: 'crawled_at',
          title: '最新时间',
          width: isWeb.value ? 200 : 180,
          sortable: true,
          cellRenderer: CrawledAtCellRenderer,
          headerCellRenderer: () => (
            <span class="column-header-label">
              最新时间
              <span
                class="tip"
                onClick={e => {
                  e.stopPropagation();
                }}
              >
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
            </span>
          ),
        },
        {
          key: 'checked_at',
          title: '邀约检测时间',
          width: isWeb.value ? 200 : 180,
          sortable: true,
          cellRenderer: CheckedAtCellRenderer,
          headerCellRenderer: () => (
            <span class="column-header-label">
              邀约检测时间
              <span
                onClick={e => {
                  e.stopPropagation();
                }}
                class="tip"
              >
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
            </span>
          ),
        },
        {
          key: 'room_id',
          title: '直播间ID',
          width: isWeb.value ? 210 : 160,
          sortable: true,
          cellRenderer: RoomIdCellRenderer,
        },
      ];
    },
  );

  const columns = computed(() => {
    if (!props.customColumns?.value?.length) {
      return baseColumns.value.filter(
        c => !props.hiddenColumns?.includes(c.key as string),
      );
    }
    let newColumns = [...baseColumns.value];
    const firstColumns: VirtualizedTableColumn<DisplayedAnchorItem>[] = [];
    const lastColumns: VirtualizedTableColumn<DisplayedAnchorItem>[] = [];
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
