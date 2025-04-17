<script setup lang="ts">
import type { Area, Region } from '@tk-crawler/biz-shared';
import type { FilterViewValues } from './filter';
import { Search } from '@element-plus/icons-vue';
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
} from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElInput, ElOption, ElSelect } from 'element-plus';
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: FilterViewValues;
  areas: Area[];
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
</script>

<template>
  <div class="filter">
    <div class="filter-items">
      <div class="filter-item">
        <label class="filter-label">主播ID</label>
        <ElInput v-model="filters.display_id" clearable size="small" />
      </div>
      <div class="filter-item">
        <label class="filter-label">数字ID</label>
        <ElInput v-model="filters.user_id" clearable size="small" />
      </div>
      <div class="filter-item">
        <label class="filter-label">邀约方式</label>
        <ElSelect v-model="filters.invite_type" size="small">
          <ElOption label="全部" value="all" />
          <ElOption label="常规邀约" :value="CanUseInvitationType.Regular" />
          <ElOption label="金牌邀约" :value="CanUseInvitationType.Elite" />
        </ElSelect>
      </div>
      <div class="filter-item">
        <label class="filter-label">主播分区</label>
        <AreaSelectSingle
          :model-value="filters.area"
          :options="areaOptions"
          size="small"
          @update:model-value="onAreaChange"
        />
      </div>
      <div class="filter-item">
        <label class="filter-label">国家或地区</label>
        <ElSelect v-model="filters.region" size="small">
          <ElOption label="全部" value="all" />
          <ElOption
            v-for="region in regionOptions"
            :key="region.value"
            :label="region.label"
            :value="region.value"
          />
        </ElSelect>
      </div>
      <div class="filter-item">
        <label class="filter-label">过滤带货</label>
        <ElSelect v-model="filters.has_commerce_goods" size="small">
          <ElOption label="全部" value="all" />
          <ElOption label="不含带货主播" :value="false" />
          <ElOption label="带货主播" :value="true" />
        </ElSelect>
      </div>
      <div class="filter-range-item">
        <label class="filter-label">主播段位</label>
        <RangeSelect
          v-model="filters.rank_league"
          :options="rankLeagueOptions"
          size="small"
          start-placeholder="从"
          end-placeholder="到"
          clearable
        />
      </div>
      <div class="filter-range-item">
        <label class="filter-label">粉丝数</label>
        <RangeNumberInput
          v-model="filters.follower_count"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div class="filter-range-item">
        <label class="filter-label">当前钻石</label>
        <RangeNumberInput
          v-model="filters.current_diamonds"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div class="filter-range-item">
        <label class="filter-label">上次钻石</label>
        <RangeNumberInput
          v-model="filters.last_diamonds"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div class="filter-range-item">
        <label class="filter-label">最高钻石</label>
        <RangeNumberInput
          v-model="filters.highest_diamonds"
          size="small"
          :min="0"
          :controls="false"
          :precision="0"
        />
      </div>
      <div class="filter-range-item">
        <label class="filter-label">最新时间</label>
        <RangeDateSelect
          v-model="filters.updated_at"
          size="small"
          type="date"
        />
      </div>
      <div class="filter-item">
        <label class="filter-label">直播标签</label>
        <ElInput v-model="filters.tag" clearable size="small" />
      </div>
      <div class="buttons">
        <ElButton type="primary" size="small" @click="handleSubmit">
          <ElIcon style="margin-right: 0.25rem">
            <Search />
          </ElIcon>
          搜索
        </ElButton>
        <ElButton type="default" size="small" @click="resetFilters">
          搜索重置
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter {
  margin-bottom: 1rem;
  display: flex;
  max-width: 100%;
  align-items: center;
  padding: 0 0.5rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 200px;
}

.filter-range-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 416px;
}

.filter-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.filter-items {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 100%;
}

.buttons {
  display: flex;
  align-items: center;

  :global(.el-button) {
    font-size: 13px;
  }
}
</style>
