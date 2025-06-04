<script setup lang="ts">
import type { SystemCrawlStatisticsResponseData } from '@tk-crawler/biz-shared';
import { InfoFilled } from '@element-plus/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import { formatTime, RESPONSE_CODE } from '@tk-crawler/shared';
import {
  useIsComponentActive,
  useIsWebSize,
  useIsWindowActive,
} from '@tk-crawler/view-shared';
import { ElButton, ElIcon, ElTooltip } from 'element-plus';
import { computed, onBeforeUnmount, ref } from 'vue';
import { getCrawlStatistics } from '../../../../requests/statistics';
import { useGlobalStore } from '../../../../utils';

defineOptions({
  name: 'CrawlerStatisticsPanel',
});

const isWebSize = useIsWebSize();

const UpdateIntervalMinutes = 5; // 更新间隔时间
const forceRefresh = ref(false);

const globalStore = useGlobalStore();
const token = computed(() => globalStore.token);

const isWindowActive = useIsWindowActive();

const isComponentActive = useIsComponentActive();

const { data, isFetching, isError, error, refetch } = useQuery<
  SystemCrawlStatisticsResponseData | undefined
>({
  queryKey: ['crawler-statistics', token],
  retry: false,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    if (!token.value) {
      return {
        statistics: {
          total_anchor_count: 0,
          total_anchors_added_24h: 0,
          total_anchors_crawled_24h: 0,
          total_anchors_added_1h: 0,
          total_anchors_crawled_1h: 0,
        },
        query_at: new Date(),
      };
    }
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
  if (!isWindowActive.value || !isComponentActive.value) {
    return;
  }
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
    class="w-full md:w-[400px] max-w-full flex flex-col gap-3 md:gap-4 p-4 md:p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg border border-gray-200/50 transition-all duration-300"
  >
    <div class="flex justify-between items-center">
      <h3
        class="m-0 text-base md:text-lg font-semibold text-gray-800 tracking-tight"
      >
        爬虫统计
      </h3>
      <ElTooltip content="比较耗费资源，请谨慎使用" placement="top">
        <ElButton
          :size="isWebSize ? 'default' : 'small'"
          :loading="isFetching"
          class="text-xs md:text-sm transition-all duration-200 hover:scale-105"
          @click="handleRefresh"
        >
          {{ isError ? '重试' : '强制刷新' }}
          <ElIcon
            :size="12"
            class="ml-1 cursor-pointer transition-transform hover:rotate-12"
          >
            <InfoFilled />
          </ElIcon>
        </ElButton>
      </ElTooltip>
    </div>

    <div class="text-xs text-gray-500 font-medium md:text-sm">
      最后更新于 {{ formattedLastUpdateTime }}
      <span class="inline ml-1">
        (每 {{ UpdateIntervalMinutes }} 分钟自动刷新一次)
      </span>
    </div>

    <div
      v-for="indicator in indicators"
      :key="indicator.label"
      class="flex justify-between items-center p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-lg border-l-4 border-gray-200 hover:border-gray-300 hover:bg-white shadow-sm hover:shadow transition-all duration-200 group"
    >
      <ElTooltip :content="indicator.tooltip" placement="top" class="flex-1">
        <span
          class="text-sm md:text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-200 break-keep"
          >{{ indicator.label }}</span
        >
      </ElTooltip>
      <span
        class="text-base md:text-lg font-bold text-gray-800 ml-3 group-hover:text-gray-900 transition-colors duration-200"
        >{{ indicator.value }}</span
      >
    </div>

    <div
      v-if="isError"
      class="text-center text-sm md:text-base text-[var(--el-color-danger)] p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-100 shadow-sm animate-fade-in"
    >
      {{ error?.message || '加载失败，请重试' }}
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
