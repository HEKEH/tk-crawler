import type { Area, DisplayedAnchorItem, Region } from '@tk-crawler/biz-shared';
import type {
  CellComponentProps,
  VirtualizedTableColumn,
} from '@tk-crawler/view-shared';
import type { ComputedRef, PropType, Ref } from 'vue';
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
import { computed, defineComponent } from 'vue';
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

// 定义基础单元格渲染器组件
const BaseCellRenderer = defineComponent({
  props: {
    rowData: {
      type: Object as PropType<DisplayedAnchorItem>,
      required: true,
    },
  },
});

// 定义各种单元格渲染器组件
const DisplayIdCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props: CellComponentProps<DisplayedAnchorItem>) {
    return () => (
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
  },
});

const ContactedByCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props: CellComponentProps<DisplayedAnchorItem>) {
    return () =>
      !props.rowData.contacted_user ? (
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
  },
});

const AssignToCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () =>
      !props.rowData.assigned_user ? (
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
  },
});

const UserIdCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => (
      <div class="number-id-container">
        <span class="number-id-text">{props.rowData.user_id}</span>
        <CopyIcon tooltip="复制主播ID" copyContent={props.rowData.user_id} />
      </div>
    );
  },
});

const AreaCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => (
      <div class="area-with-tooltip">
        {AREA_NAME_MAP[props.rowData.area as Area] || '-'}
        <AreaTooltipIcon area={props.rowData.area as Area} />
      </div>
    );
  },
});

const RegionCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => (
      <span>
        {REGION_LABEL_MAP[props.rowData.region as Region]
          ? `${REGION_LABEL_MAP[props.rowData.region as Region]} (${props.rowData.region})`
          : props.rowData.region}
      </span>
    );
  },
});

const CheckedResultCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () =>
      props.rowData.checked_result ? (
        <ElTag type="success">是</ElTag>
      ) : (
        <ElTag type="danger">否</ElTag>
      );
  },
});

const InviteTypeCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () =>
      props.rowData.invite_type === CanUseInvitationType.Elite ? (
        <ElTag type="warning">金票邀约</ElTag>
      ) : props.rowData.invite_type === CanUseInvitationType.Regular ? (
        <ElTag type="success">常规邀约</ElTag>
      ) : (
        <span>-</span>
      );
  },
});

const AudienceCountCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{props.rowData.audience_count ?? '-'}</span>;
  },
});

const LastDiamondsCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{props.rowData.last_diamonds ?? '-'}</span>;
  },
});

const RankLeagueCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{props.rowData.rank_league ?? '-'}</span>;
  },
});

const HasCommerceGoodsCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{props.rowData.has_commerce_goods ? '是' : '否'}</span>;
  },
});

const TagCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{props.rowData.tag || '-'}</span>;
  },
});

const CrawledAtCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{formatDateTime(props.rowData.crawled_at)}</span>;
  },
});

const CheckedAtCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => <span>{formatDateTime(props.rowData.checked_at)}</span>;
  },
});

const RoomIdCellRenderer = defineComponent({
  extends: BaseCellRenderer,
  setup(props) {
    return () => (
      <div class="number-id-container">
        <span class="number-id-text">
          {props.rowData.room_id && props.rowData.room_id !== '0'
            ? props.rowData.room_id
            : '-'}
        </span>
        <CopyIcon tooltip="复制直播间ID" copyContent={props.rowData.room_id} />
      </div>
    );
  },
});

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
          CellComponent: DisplayIdCellRenderer,
        },
        {
          key: 'contacted_by',
          title: '建联状态',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          CellComponent: ContactedByCellRenderer,
        },
        {
          key: 'assign_to',
          title: '分配状态',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          CellComponent: AssignToCellRenderer,
        },
        {
          key: 'user_id',
          title: '主播ID',
          width: isWeb.value ? 210 : 160,
          sortable: true,
          CellComponent: UserIdCellRenderer,
        },
        {
          key: 'area',
          title: '主播分区',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          CellComponent: AreaCellRenderer,
        },
        {
          key: 'region',
          title: '国家或地区',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          CellComponent: RegionCellRenderer,
        },
        {
          key: 'checked_result',
          title: '可邀约',
          width: isWeb.value ? 100 : 80,
          sortable: true,
          CellComponent: CheckedResultCellRenderer,
        },
        {
          key: 'invite_type',
          title: '邀约方式',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          CellComponent: InviteTypeCellRenderer,
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
          CellComponent: AudienceCountCellRenderer,
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
          CellComponent: LastDiamondsCellRenderer,
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
          CellComponent: RankLeagueCellRenderer,
        },
        {
          key: 'has_commerce_goods',
          title: '带货主播',
          width: isWeb.value ? 120 : 100,
          sortable: true,
          CellComponent: HasCommerceGoodsCellRenderer,
        },
        {
          key: 'tag',
          title: '直播标签',
          width: isWeb.value ? 140 : 120,
          sortable: true,
          CellComponent: TagCellRenderer,
        },
        {
          key: 'crawled_at',
          title: '最新时间',
          width: isWeb.value ? 200 : 180,
          sortable: true,
          CellComponent: CrawledAtCellRenderer,
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
          CellComponent: CheckedAtCellRenderer,
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
          CellComponent: RoomIdCellRenderer,
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
