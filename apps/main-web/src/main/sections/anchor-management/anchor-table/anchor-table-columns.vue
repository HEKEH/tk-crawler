<script setup lang="ts">
import type { Area, DisplayedAnchorItem, Region } from '@tk-crawler/biz-shared';
import type { TableColumnCtx } from 'element-plus';
import {
  AREA_NAME_MAP,
  CanUseInvitationType,
  REGION_LABEL_MAP,
  TIKTOK_URL,
} from '@tk-crawler/biz-shared';
import { formatDateTime, getColorFromName } from '@tk-crawler/shared';
import { AreaTooltipIcon, CopyIcon, useIsWeb } from '@tk-crawler/view-shared';
import { ElLink, ElTableColumn, ElTag } from 'element-plus';

defineOptions({
  name: 'TKAnchorTableColumns',
});

defineProps<Props>();

const isWeb = useIsWeb();

interface Props {
  hiddenColumns?: string[];
}

interface ScopeType {
  row: DisplayedAnchorItem;
  column: TableColumnCtx<DisplayedAnchorItem>;
  $index: number;
}
</script>

<template>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('selection')"
    type="selection"
    width="30"
    :fixed="!isWeb ? 'left' : undefined"
  />
  <!-- 基本信息 -->
  <ElTableColumn
    v-if="!hiddenColumns?.includes('display_id')"
    prop="display_id"
    label="主播ID"
    :width="isWeb ? 160 : 140"
    sortable="custom"
    :fixed="!isWeb ? 'left' : undefined"
  >
    <template #default="scope: ScopeType">
      <div class="display-id-container">
        <ElLink
          type="primary"
          class="display-id-link"
          :href="`${TIKTOK_URL}/@${scope.row.display_id}`"
          target="_blank"
        >
          {{ scope.row.display_id }}
        </ElLink>
        <CopyIcon tooltip="复制主播ID" :copy-content="scope.row.display_id" />
      </div>
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('user_id')"
    prop="user_id"
    label="数字ID"
    :width="isWeb ? 210 : 160"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      <div class="user-id-container">
        <span class="user-id-text">{{ scope.row.user_id }}</span>
        <CopyIcon tooltip="复制数字ID" :copy-content="scope.row.user_id" />
      </div>
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('contacted_by')"
    prop="contacted_by"
    label="建联状态"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      <ElTag v-if="!scope.row.contacted_user" class="org-user-tag" type="info">
        未建联
      </ElTag>
      <ElTag
        v-else
        type="success"
        class="org-user-tag"
        :style="{
          color: getColorFromName(scope.row.contacted_user.display_name),
        }"
      >
        {{ scope.row.contacted_user.display_name }}
      </ElTag>
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('assign_to')"
    prop="assign_to"
    label="分配状态"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      <ElTag v-if="!scope.row.assigned_user" class="org-user-tag" type="info">
        未分配
      </ElTag>
      <ElTag
        v-else
        type="success"
        class="org-user-tag"
        :style="{
          color: getColorFromName(scope.row.assigned_user.display_name),
        }"
      >
        {{ scope.row.assigned_user.display_name }}
      </ElTag>
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('area')"
    prop="area"
    label="主播分区"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      <div class="area-with-tooltip">
        {{ AREA_NAME_MAP[scope.row.area as Area] || '-' }}
        <AreaTooltipIcon :area="scope.row.area as Area" />
      </div>
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('region')"
    prop="region"
    label="国家或地区"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{
        REGION_LABEL_MAP[scope.row.region as Region]
          ? `${REGION_LABEL_MAP[scope.row.region as Region]} (${scope.row.region})`
          : scope.row.region
      }}
    </template>
  </ElTableColumn>

  <ElTableColumn
    v-if="!hiddenColumns?.includes('checked_result')"
    prop="checked_result"
    label="可邀约"
    min-width="100"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      <ElTag v-if="scope.row.checked_result" type="success"> 是 </ElTag>
      <ElTag v-else type="danger"> 否 </ElTag>
    </template>
  </ElTableColumn>

  <!-- 邀约相关 -->
  <ElTableColumn
    v-if="!hiddenColumns?.includes('invite_type')"
    prop="invite_type"
    label="邀约方式"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
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
  <!-- 数据统计 -->
  <ElTableColumn
    v-if="!hiddenColumns?.includes('follower_count')"
    prop="follower_count"
    label="粉丝数"
    min-width="120"
    sortable="custom"
  />
  <ElTableColumn
    v-if="!hiddenColumns?.includes('audience_count')"
    prop="audience_count"
    label="直播间观众数"
    min-width="140"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ scope.row.audience_count ?? '-' }}
    </template>
  </ElTableColumn>

  <!-- 钻石相关 -->
  <ElTableColumn
    v-if="!hiddenColumns?.includes('current_diamonds')"
    prop="current_diamonds"
    label="当前钻石"
    min-width="120"
    sortable="custom"
  />
  <ElTableColumn
    v-if="!hiddenColumns?.includes('last_diamonds')"
    prop="last_diamonds"
    label="上次钻石"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ scope.row.last_diamonds ?? '-' }}
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('highest_diamonds')"
    prop="highest_diamonds"
    label="最高钻石"
    min-width="120"
    sortable="custom"
  />

  <ElTableColumn
    v-if="!hiddenColumns?.includes('rank_league')"
    prop="rank_league"
    label="直播段位"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ scope.row.rank_league ?? '-' }}
    </template>
  </ElTableColumn>

  <!-- 其他信息 -->
  <ElTableColumn
    v-if="!hiddenColumns?.includes('has_commerce_goods')"
    prop="has_commerce_goods"
    label="带货主播"
    min-width="120"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ scope.row.has_commerce_goods ? '是' : '否' }}
    </template>
  </ElTableColumn>
  <ElTableColumn
    v-if="!hiddenColumns?.includes('tag')"
    prop="tag"
    label="直播标签"
    min-width="140"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ scope.row.tag || '-' }}
    </template>
  </ElTableColumn>

  <ElTableColumn
    v-if="!hiddenColumns?.includes('room_id')"
    prop="room_id"
    label="直播间ID"
    min-width="190"
    sortable="custom"
  />

  <ElTableColumn
    v-if="!hiddenColumns?.includes('crawled_at')"
    prop="crawled_at"
    label="最新时间"
    min-width="200"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ formatDateTime(scope.row.crawled_at) }}
    </template>
  </ElTableColumn>

  <!-- 时间信息 -->
  <!-- <ElTableColumn
    v-if="!hiddenColumns?.includes('checked_at')"
    prop="checked_at"
    label="校验时间"
    min-width="192"
    sortable="custom"
  >
    <template #default="scope: ScopeType">
      {{ formatDateTime(scope.row.checked_at) }}
    </template>
  </ElTableColumn> -->
</template>

<style scoped>
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
.org-user-tag {
  width: 100%;
  :global(.el-tag__content) {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
