<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { ElButton, ElTooltip } from 'element-plus';
import { getCrawlStatistics } from '../../../requests/statistics';
import { SystemCrawlStatisticsResponseData } from '@tk-crawler/biz-shared';
import { formatTime, RESPONSE_CODE } from '@tk-crawler/shared';
import { useGlobalStore } from '../../../utils';
import { computed, onBeforeUnmount, ref } from 'vue';

defineOptions({
  name: 'CrawlerStatisticsPanel',
});

const UpdateIntervalMinutes = 5; // 更新间隔时间
const forceRefresh = ref(false);

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);

const { data, isFetching, isError, error, refetch } = useQuery<
  SystemCrawlStatisticsResponseData | undefined
>({
  queryKey: ['crawler-statistics', token, forceRefresh],
  retry: false,
  queryFn: async () => {
    const response = await getCrawlStatistics(
      { force_refresh: forceRefresh.value },
      token.value,
    );
    // Reset force refresh flag after use
    forceRefresh.value = false;
    if (response.status_code !== RESPONSE_CODE.SUCCESS) {
      throw new Error(response.message);
    }
    return response.data;
  },
  placeholderData: previousData => previousData,
});

const refetchInterval = setInterval(refetch, UpdateIntervalMinutes * 60 * 1000);

onBeforeUnmount(() => {
  clearInterval(refetchInterval);
});

const handleRefresh = () => {
  forceRefresh.value = true;
  refetch();
};

const indicators = computed(() => {
  console.log('data.value', data.value);
  const { statistics } = data.value ?? {};
  return [
    {
      label: '主播总数',
      value: statistics?.total_anchor_count ?? 0,
      tooltip: '当前系统中的主播总数',
    },
    {
      label: '24小时新增主播',
      value: statistics?.total_anchors_added_24h ?? 0,
      tooltip: '过去24小时内新增的主播数量',
    },
    {
      label: '24小时更新主播(含新增)',
      value: statistics?.total_anchors_crawled_24h ?? 0,
      tooltip: '过去24小时内更新或新增的主播数量',
    },
    {
      label: '1小时新增主播',
      value: statistics?.total_anchors_added_1h ?? 0,
      tooltip: '过去1小时内新增的主播数量',
    },
    {
      label: '1小时更新主播(含新增)',
      value: statistics?.total_anchors_crawled_1h ?? 0,
      tooltip: '过去1小时内更新或新增的主播数量',
    },
  ];
});

const formattedLastUpdateTime = computed(() => {
  if (!data.value?.query_at) return '';
  return formatTime(data.value.query_at);
});
</script>

<template>
  <div class="statistics-panel" v-loading="isFetching">
    <div class="statistics-panel-header">
      <h3>爬虫统计</h3>
      <ElButton size="small" @click="handleRefresh" :loading="isFetching">
        {{ isError ? '重试' : '强制刷新' }}
      </ElButton>
    </div>

    <div class="last-update-time">
      最后更新于 {{ formattedLastUpdateTime }} (每
      {{ UpdateIntervalMinutes }} 分钟自动刷新一次)
    </div>

    <div
      class="statistics-panel-item"
      v-for="indicator in indicators"
      :key="indicator.label"
    >
      <ElTooltip :content="indicator.tooltip" placement="top">
        <span class="statistics-panel-item-label">{{ indicator.label }}</span>
      </ElTooltip>
      <span class="statistics-panel-item-value">{{ indicator.value }}</span>
    </div>

    <div v-if="isError" class="error-message">
      {{ error?.message || '加载失败，请重试' }}
    </div>
  </div>
</template>

<style scoped>
.statistics-panel {
  width: 300px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.statistics-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.last-update-time {
  font-size: 12px;
  color: #666;
}

.statistics-panel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.statistics-panel-item:hover {
  background-color: #f0f0f0;
}

.statistics-panel-item-label {
  color: #666;
  font-size: 14px;
}

.statistics-panel-item-value {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.error-message {
  color: var(--el-color-danger);
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background-color: #fef0f0;
  border-radius: 4px;
}
</style>
