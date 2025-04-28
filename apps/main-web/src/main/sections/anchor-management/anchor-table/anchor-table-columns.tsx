import type { Area, DisplayedAnchorItem, Region } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import type { JSX } from 'vue/jsx-runtime';
import {
  AREA_NAME_MAP,
  CanUseInvitationType,
  REGION_LABEL_MAP,
  TIKTOK_URL,
} from '@tk-crawler/biz-shared';
import { formatDateTime, getColorFromName } from '@tk-crawler/shared';
import { AreaTooltipIcon, CopyIcon, useIsWeb } from '@tk-crawler/view-shared';
import { ElLink, ElTableColumn, ElTag } from 'element-plus';
import { computed, defineComponent, type PropType } from 'vue';
import './anchor-table-columns.scss';

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}

interface ColumnConfig {
  key: string;
  props?: Record<string, any>;
  renderColumn?: () => JSX.Element;
  render?: (scope: ScopeType) => JSX.Element | string | number | null;
}

export interface CustomColumnConfig extends ColumnConfig {
  isFirst?: boolean;
  isLast?: boolean;
  before?: string;
  after?: string;
}

export default defineComponent({
  name: 'TKAnchorTableColumns',
  props: {
    hiddenColumns: Array as PropType<string[]>,
    customColumns: Array as PropType<CustomColumnConfig[]>,
  },
  setup(props) {
    const isWeb = useIsWeb();

    const baseColumns = computed<ColumnConfig[]>(() => {
      return [
        {
          key: 'selection',
          props: {
            type: 'selection',
            width: 30,
            fixed: !isWeb.value ? 'left' : undefined,
          },
        },
        {
          key: 'display_id',
          props: {
            label: '主播ID',
            width: isWeb.value ? 160 : 140,
            sortable: 'custom',
            fixed: !isWeb.value ? 'left' : undefined,
          },
          render: scope => (
            <div class="display-id-container">
              <ElLink
                type="primary"
                class="display-id-link"
                href={`${TIKTOK_URL}/@${scope.row.display_id}`}
                target="_blank"
              >
                {scope.row.display_id}
              </ElLink>
              <CopyIcon
                tooltip="复制主播ID"
                copyContent={scope.row.display_id}
              />
            </div>
          ),
        },
        {
          key: 'contacted_by',
          props: {
            label: '建联状态',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope =>
            !scope.row.contacted_user ? (
              <ElTag class="org-user-tag" type="info">
                未建联
              </ElTag>
            ) : (
              <ElTag
                type="success"
                class="org-user-tag"
                style={{
                  color: getColorFromName(
                    scope.row.contacted_user.display_name,
                  ),
                }}
              >
                {scope.row.contacted_user.display_name}
              </ElTag>
            ),
        },
        {
          key: 'assign_to',
          props: {
            label: '分配状态',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope =>
            !scope.row.assigned_user ? (
              <ElTag class="org-user-tag" type="info">
                未分配
              </ElTag>
            ) : (
              <ElTag
                type="success"
                class="org-user-tag"
                style={{
                  color: getColorFromName(scope.row.assigned_user.display_name),
                }}
              >
                {scope.row.assigned_user.display_name}
              </ElTag>
            ),
        },
        {
          key: 'area',
          props: {
            label: '主播分区',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope => (
            <div class="area-with-tooltip">
              {AREA_NAME_MAP[scope.row.area as Area] || '-'}
              <AreaTooltipIcon area={scope.row.area as Area} />
            </div>
          ),
        },
        {
          key: 'region',
          props: {
            label: '国家或地区',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope =>
            REGION_LABEL_MAP[scope.row.region as Region]
              ? `${REGION_LABEL_MAP[scope.row.region as Region]} (${scope.row.region})`
              : scope.row.region,
        },
        {
          key: 'checked_result',
          props: {
            label: '可邀约',
            'min-width': isWeb.value ? 100 : 80,
            sortable: 'custom',
          },
          render: scope =>
            scope.row.checked_result ? (
              <ElTag type="success">是</ElTag>
            ) : (
              <ElTag type="danger">否</ElTag>
            ),
        },
        {
          key: 'invite_type',
          props: {
            label: '邀约方式',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope =>
            scope.row.invite_type === CanUseInvitationType.Elite ? (
              <ElTag type="warning">金票邀约</ElTag>
            ) : scope.row.invite_type === CanUseInvitationType.Regular ? (
              <ElTag type="success">常规邀约</ElTag>
            ) : (
              <span>-</span>
            ),
        },
        {
          key: 'follower_count',
          props: {
            label: '粉丝数',
            'min-width': isWeb.value ? 120 : 90,
            sortable: 'custom',
          },
        },
        {
          key: 'audience_count',
          props: {
            label: '直播间观众数',
            'min-width': isWeb.value ? 140 : 120,
            sortable: 'custom',
          },
          render: scope => scope.row.audience_count ?? '-',
        },
        {
          key: 'current_diamonds',
          props: {
            label: '当前钻石',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
        },
        {
          key: 'last_diamonds',
          props: {
            label: '上次钻石',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope => scope.row.last_diamonds ?? '-',
        },
        {
          key: 'highest_diamonds',
          props: {
            label: '最高钻石',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
        },
        {
          key: 'rank_league',
          props: {
            label: '直播段位',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope => scope.row.rank_league ?? '-',
        },
        {
          key: 'has_commerce_goods',
          props: {
            label: '带货主播',
            'min-width': isWeb.value ? 120 : 100,
            sortable: 'custom',
          },
          render: scope => (scope.row.has_commerce_goods ? '是' : '否'),
        },
        {
          key: 'tag',
          props: {
            label: '直播标签',
            'min-width': isWeb.value ? 140 : 120,
            sortable: 'custom',
          },
          render: scope => scope.row.tag || '-',
        },
        {
          key: 'crawled_at',
          props: {
            label: '最新时间',
            'min-width': isWeb.value ? 200 : 180,
            sortable: 'custom',
          },
          render: scope => formatDateTime(scope.row.crawled_at),
        },
        {
          key: 'user_id',
          props: {
            label: '数字ID',
            'min-width': isWeb.value ? 210 : 160,
            sortable: 'custom',
          },
          render: scope => (
            <div class="number-id-container">
              <span class="number-id-text">{scope.row.user_id}</span>
              <CopyIcon tooltip="复制数字ID" copyContent={scope.row.user_id} />
            </div>
          ),
        },
        {
          key: 'room_id',
          props: {
            label: '直播间ID',
            'min-width': isWeb.value ? 210 : 160,
            sortable: 'custom',
          },
          render: scope => (
            <div class="number-id-container">
              <span class="number-id-text">
                {scope.row.room_id && scope.row.room_id !== '0'
                  ? scope.row.room_id
                  : '-'}
              </span>
              <CopyIcon
                tooltip="复制直播间ID"
                copyContent={scope.row.room_id}
              />
            </div>
          ),
        },
      ];
    });

    const columns = computed(() => {
      if (!props.customColumns?.length) {
        return baseColumns.value;
      }
      let newColumns = [...baseColumns.value];
      const firstColumns: CustomColumnConfig[] = [];
      const lastColumns: CustomColumnConfig[] = [];
      props.customColumns.forEach(column => {
        if (column.isFirst) {
          firstColumns.push(column);
        } else if (column.isLast) {
          lastColumns.push(column);
        } else if (column.before) {
          const index = newColumns.findIndex(c => c.key === column.before);
          if (index !== -1) {
            newColumns.splice(index, 0, column);
          } else {
            throw new Error(`Column ${column.key} not found`);
          }
        } else if (column.after) {
          const index = newColumns.findIndex(c => c.key === column.after);
          if (index !== -1) {
            newColumns.splice(index + 1, 0, column);
          } else {
            throw new Error(`Column ${column.key} not found`);
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

      return newColumns;
    });

    return () => (
      <>
        {columns.value.map(
          column =>
            !props.hiddenColumns?.includes(column.key) &&
            (column.renderColumn ? (
              column.renderColumn()
            ) : (
              <ElTableColumn
                key={column.key}
                {...column.props}
                prop={column.key}
                v-slots={
                  column.render
                    ? {
                        default: (scope: ScopeType) => column.render!(scope),
                      }
                    : undefined
                }
              />
            )),
        )}
      </>
    );
  },
});
