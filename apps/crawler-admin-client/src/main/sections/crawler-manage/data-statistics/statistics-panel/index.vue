<script setup lang="ts">
import type { SystemCrawlStatisticsResponseData } from '@tk-crawler/biz-shared';
import { useQuery } from '@tanstack/vue-query';
import { formatTime, RESPONSE_CODE } from '@tk-crawler/shared';
import { ElButton, ElTooltip } from 'element-plus';
import { computed, onBeforeUnmount, ref } from 'vue';
import { getCrawlStatistics } from '../../../../requests/statistics';
import { useGlobalStore } from '../../../../utils';

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
  queryKey: ['crawler-statistics', token],
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

function handleRefresh() {
  forceRefresh.value = true;
  refetch();
}

const indicators = computed(() => {
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
  if (!data.value?.query_at) {
    return '';
  }
  return formatTime(data.value.query_at);
});
</script>

<template>
  <div
    v-loading="isFetching"
    class="w-full md:w-[300px] max-w-full flex flex-col gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-gray-100 shadow-md"
  >
    <div class="flex justify-between items-center">
      <h3 class="m-0 text-sm md:text-base text-gray-800">爬虫统计</h3>
      <ElButton
        size="small"
        :loading="isFetching"
        class="text-xs md:text-sm"
        @click="handleRefresh"
      >
        {{ isError ? '重试' : '强制刷新' }}
      </ElButton>
    </div>

    <div class="text-xs text-gray-500">
      最后更新于 {{ formattedLastUpdateTime }}
      <span class="inline"
        >(每 {{ UpdateIntervalMinutes }} 分钟自动刷新一次)</span
      >
    </div>

    <div
      v-for="indicator in indicators"
      :key="indicator.label"
      class="flex justify-between items-center p-2 md:p-3 bg-white rounded hover:bg-gray-100 transition-colors"
    >
      <ElTooltip :content="indicator.tooltip" placement="top" class="flex-1">
        <span class="text-xs md:text-sm text-gray-500 break-keep">{{
          indicator.label
        }}</span>
      </ElTooltip>
      <span class="text-sm md:text-base font-semibold text-gray-800 ml-2">{{
        indicator.value
      }}</span>
    </div>

    <div
      v-if="isError"
      class="text-center text-xs md:text-sm text-[var(--el-color-danger)] p-2 bg-red-50 rounded"
    >
      {{ error?.message || '加载失败，请重试' }}
    </div>
  </div>
</template>
