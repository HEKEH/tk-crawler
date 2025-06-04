<script setup lang="ts">
import type { Area, Region } from '@tk-crawler/biz-shared';
import type { FilterViewValues } from './filter';
import { Refresh, Search } from '@element-plus/icons-vue';
import { DoubleDownIcon, DoubleUpIcon } from '@tk-crawler/assets';
import {
  AnchorRankLeague,
  AREA_NAME_MAP,
  CanUseInvitationType,
  getRegionsByArea,
  REGION_LABEL_MAP,
} from '@tk-crawler/biz-shared';
import {
  AreaSelectSingle,
  RangeDateSelect,
  RangeNumberInput,
  RangeSelect,
  useIsMobileSize,
} from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';
import { OrgMemberSelectSingle } from '../../../components';
import '@tk-crawler/styles/table-header-filter.scss';

const props = defineProps<{
  modelValue: FilterViewValues;
  areas: Area[];
  hiddenFilters?: string[];
}>();

const emit = defineEmits<{
  submit: [value: FilterViewValues];
  reset: [];
}>();

const filters = ref<FilterViewValues>(cloneDeep(props.modelValue));

// 监听 props 变化
watch(
  () => props.modelValue,
  newVal => {
    filters.value = cloneDeep(newVal);
  },
);

const areaOptions = computed(() => {
  return props.areas.map(area => ({
    value: area,
    label: AREA_NAME_MAP[area],
  }));
});

function onAreaChange(area: Area | 'all' | undefined) {
  if (area !== filters.value.area) {
    filters.value.region = 'all';
  }
  filters.value.area = area;
}

const regionOptions = computed(() => {
  const { area } = filters.value;
  const { areas } = props;
  let regions: Region[] = [];
  if (area === 'all' || area === undefined) {
    regions = areas.map(area => getRegionsByArea(area)).flat();
  } else {
    regions = getRegionsByArea(area);
  }
  return regions.map(region => ({
    value: region,
    label: REGION_LABEL_MAP[region],
  }));
});

const rankLeagueOptions = Object.values(AnchorRankLeague).map(league => ({
  label: league,
  value: league,
}));

// 处理过滤器变化
function handleSubmit() {
  emit('submit', cloneDeep(filters.value));
}

// 重置过滤器
function resetFilters() {
  emit('reset');
}
const isMobile = useIsMobileSize();

const isExpanded = ref(false);
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div class="table-header-filter">
    <div
      class="filter-items"
      :class="
        !isMobile
          ? undefined
          : isExpanded
            ? 'filter-items-expanded'
            : 'filter-items-collapsed'
      "
    >
      <div v-if="!hiddenFilters?.includes('contacted_by')" class="filter-item">
        <label class="filter-label">建联状态</label>
        <OrgMemberSelectSingle
          v-model="filters.contacted_by"
          show-all
          show-contacted
          show-not-contacted
          self-first
          size="small"
          popper-class="custom-filter-select"
        />
      </div>
      <div
        v-if="!hiddenFilters?.includes('contacted_by_simple')"
        class="filter-item"
      >
        <label class="filter-label">建联状态</label>
        <ElSelect
          v-model="filters.contacted_by"
          popper-class="custom-filter-select"
          size="small"
        >
          <ElOption label="全部" value="all" />
          <ElOption label="已建联" value="contacted" />
          <ElOption label="未建联" value="not_contacted" />
        </ElSelect>
      </div>
      <div v-if="!hiddenFilters?.includes('assign_to')" class="filter-item">
        <label class="filter-label">分配状态</label>
        <OrgMemberSelectSingle
          v-model="filters.assign_to"
          show-all
          show-assigned
          show-not-assigned
          self-first
          size="small"
          popper-class="custom-filter-select"
        />
      </div>
      <div v-if="!hiddenFilters?.includes('area')" class="filter-item">
        <label class="filter-label">主播分区</label>
        <AreaSelectSingle
          :model-value="filters.area"
          :options="areaOptions"
          size="small"
          popper-class="custom-filter-select"
          @update:model-value="onAreaChange"
        />
      </div>
      <div v-if="!hiddenFilters?.includes('region')" class="filter-item">
        <label class="filter-label">国家或地区</label>
        <ElSelect
          v-model="filters.region"
          size="small"
          popper-class="custom-filter-select"
        >
          <ElOption label="全部" value="all" />
          <ElOption
            v-for="region in regionOptions"
            :key="region.value"
            :label="region.label"
            :value="region.value"
          />
        </ElSelect>
      </div>
      <div
        v-if="!hiddenFilters?.includes('checked_result')"
        class="filter-item"
      >
        <label class="filter-label">可邀约</label>
        <ElSelect
          v-model="filters.checked_result"
          size="small"
          popper-class="custom-filter-select"
        >
          <ElOption label="全部" value="all" />
          <ElOption label="是" :value="true" />
          <ElOption label="否" :value="false" />
        </ElSelect>
      </div>
      <div v-if="!hiddenFilters?.includes('invite_type')" class="filter-item">
        <label class="filter-label">邀约方式</label>
        <ElSelect
          v-model="filters.invite_type"
          size="small"
          popper-class="custom-filter-select"
        >
          <ElOption label="全部" value="all" />
          <ElOption label="常规邀约" :value="CanUseInvitationType.Regular" />
          <ElOption label="金牌邀约" :value="CanUseInvitationType.Elite" />
        </ElSelect>
      </div>
      <div
        v-if="!hiddenFilters?.includes('has_commerce_goods')"
        class="filter-item"
      >
        <label class="filter-label">过滤带货</label>
        <ElSelect
          v-model="filters.has_commerce_goods"
          size="small"
          popper-class="custom-filter-select"
        >
          <ElOption label="全部" value="all" />
          <ElOption label="不含带货主播" :value="false" />
          <ElOption label="带货主播" :value="true" />
        </ElSelect>
      </div>
      <div v-if="!hiddenFilters?.includes('tag')" class="filter-item">
        <label class="filter-label">直播标签</label>
        <ElInput v-model="filters.tag" clearable size="small" />
      </div>
      <div
        v-if="!hiddenFilters?.includes('rank_league')"
        class="filter-range-item"
      >
        <label class="filter-label">直播段位</label>
        <RangeSelect
          v-model="filters.rank_league"
          :options="rankLeagueOptions"
          size="small"
          start-placeholder="从"
          end-placeholder="到"
          clearable
        />
      </div>
      <div
        v-if="!hiddenFilters?.includes('follower_count')"
        class="filter-range-item"
      >
        <label class="filter-label">粉丝数</label>
        <RangeNumberInput
          v-model="filters.follower_count"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div
        v-if="!hiddenFilters?.includes('current_diamonds')"
        class="filter-range-item"
      >
        <label class="filter-label">当前钻石</label>
        <RangeNumberInput
          v-model="filters.current_diamonds"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div
        v-if="!hiddenFilters?.includes('last_diamonds')"
        class="filter-range-item"
      >
        <label class="filter-label">上次钻石</label>
        <RangeNumberInput
          v-model="filters.last_diamonds"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div
        v-if="!hiddenFilters?.includes('highest_diamonds')"
        class="filter-range-item"
      >
        <label class="filter-label">最高钻石</label>
        <RangeNumberInput
          v-model="filters.highest_diamonds"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <!-- <div
        v-if="!hiddenFilters?.includes('checked_at')"
        class="filter-range-item"
      >
        <label class="filter-label">最新时间</label>
        <RangeDateSelect
          v-model="filters.checked_at"
          size="small"
          type="datetime"
          start-placeholder="从"
          end-placeholder="到"
          clearable
        />
      </div>
    </div> -->
      <div
        v-if="!hiddenFilters?.includes('crawled_at')"
        class="filter-range-item"
      >
        <label class="filter-label">最新时间</label>
        <RangeDateSelect
          v-model="filters.crawled_at"
          size="small"
          type="datetime"
          start-placeholder="从"
          end-placeholder="到"
          clearable
        />
      </div>
      <div
        v-if="!hiddenFilters?.includes('checked_at')"
        class="filter-range-item"
      >
        <label class="filter-label">邀约检测时间</label>
        <RangeDateSelect
          v-model="filters.checked_at"
          size="small"
          type="datetime"
          start-placeholder="从"
          end-placeholder="到"
          clearable
        />
      </div>
      <!-- <div v-if="!hiddenFilters?.includes('display_id')" class="filter-item">
        <label class="filter-label">主播展示ID</label>
        <ElInput v-model="filters.display_id" clearable size="small" />
      </div>
      <div v-if="!hiddenFilters?.includes('user_id')" class="filter-item">
        <label class="filter-label">主播ID</label>
        <ElInput v-model="filters.user_id" clearable size="small" />
      </div> -->
      <!-- <div v-if="!hiddenFilters?.includes('room_id')" class="filter-item">
        <label class="filter-label">直播间ID</label>
        <ElInput v-model="filters.room_id" clearable size="small" />
      </div> -->
    </div>
    <div class="buttons">
      <ElButton type="primary" size="small" @click="handleSubmit">
        <ElIcon style="margin-right: 0.25rem">
          <Search />
        </ElIcon>
        搜索
      </ElButton>
      <ElButton type="default" size="small" @click="resetFilters">
        <ElIcon style="margin-right: 0.25rem">
          <Refresh />
        </ElIcon>
        搜索重置
      </ElButton>
      <ElButton
        v-if="isMobile"
        type="default"
        size="small"
        @click="toggleExpand"
      >
        <ElIcon style="margin-right: 0.25rem">
          <DoubleDownIcon v-if="!isExpanded" width="16" height="16" />
          <DoubleUpIcon v-else width="16" height="16" />
        </ElIcon>
        {{ isExpanded ? '收起' : '展开' }}
      </ElButton>
      <slot name="extra-buttons" />
    </div>
  </div>
</template>
