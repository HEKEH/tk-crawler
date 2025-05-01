<script setup lang="ts">
import type { Area, SimpleCrawlStatistics } from '@tk-crawler/biz-shared';
import type { Ref } from 'vue';
import {
  CopyDocument,
  InfoFilled,
  Setting,
  Switch,
  SwitchButton,
} from '@element-plus/icons-vue';
import { CrawlStatus } from '@tk-crawler/biz-shared';
import { formatDuration, setIntervalImmediate } from '@tk-crawler/shared';
import { AreaSelectSingle, copyToClipboard } from '@tk-crawler/view-shared';
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElNotification,
  ElTooltip,
} from 'element-plus';
import { computed, onBeforeUnmount, ref } from 'vue';
import { CRAWL_EVENTS } from '../../constants';
import { useGlobalStore } from '../../utils';
import ControlButtons from './control-buttons.vue';

defineOptions({
  name: 'CrawlerManageNormalView',
});

const globalStore = useGlobalStore();

const crawlerManage = computed(() => globalStore.crawlerManage);

const statistics: Ref<
  | ({
      duration: number;
    } & Pick<SimpleCrawlStatistics, 'anchorUpdateTimes' | 'feedNumber'>)
  | undefined
> = ref(undefined);
async function updateStatistics() {
  await crawlerManage.value.updateSimpleCrawlStatistics();
  const crawlStartTime =
    crawlerManage.value.simpleCrawlStatistics.crawlStartTime;
  if (!crawlStartTime) {
    statistics.value = undefined;
    return;
  }
  const duration = new Date().getTime() - new Date(crawlStartTime).getTime();
  statistics.value = {
    duration,
    anchorUpdateTimes:
      crawlerManage.value.simpleCrawlStatistics.anchorUpdateTimes,
    feedNumber: crawlerManage.value.simpleCrawlStatistics.feedNumber,
  };
}

let statisticsInterval: NodeJS.Timeout | null = setIntervalImmediate(
  updateStatistics,
  1000,
);

function clearStatistics() {
  if (statisticsInterval) {
    clearInterval(statisticsInterval);
    statisticsInterval = null;
  }
  statistics.value = undefined;
  crawlerManage.value.clearSimpleCrawlStatistics();
}

async function start() {
  if (!statisticsInterval) {
    statisticsInterval = setIntervalImmediate(updateStatistics, 1000);
  }
  await crawlerManage.value.start();
}
async function stop() {
  await crawlerManage.value.stop();
  clearStatistics();
}
const crawlArea = ref<Area | 'all'>('all');

function handleCrawlAreaChange(area: Area | 'all' = 'all') {
  crawlArea.value = area;
  window.ipcRenderer.invoke(CRAWL_EVENTS.SET_CRAWL_AREA, area);
}

const crawlAreaInterval = setIntervalImmediate(async () => {
  try {
    const area = await window.ipcRenderer.invoke(CRAWL_EVENTS.GET_CRAWL_AREA);
    crawlArea.value = area;
  } catch (error) {
    console.error(error);
  }
}, 1000);

onBeforeUnmount(() => {
  clearInterval(crawlAreaInterval);
});

async function handleSwitchTKAccount() {
  await crawlerManage.value.loginTiktok();
}

async function handleCopyCookie() {
  const cookie = await window.ipcRenderer.invoke(CRAWL_EVENTS.GET_TK_COOKIE);
  if (cookie) {
    await copyToClipboard(cookie);
  } else {
    ElMessage.warning('未获取到已保存的Cookie');
  }
}

async function handleClearTKCookie() {
  await stop();
  await window.ipcRenderer.invoke(CRAWL_EVENTS.CLEAR_TIKTOK_COOKIE);
  ElNotification.success('TK Cookie已清除');
  await crawlerManage.value.checkTiktokCookieValid();
}
</script>

<template>
  <div class="normal-view">
    <div class="normal-view-header">
      <div class="normal-view-header-left"></div>
      <div class="normal-view-header-right">
        <div v-if="crawlerManage.account">
          TK账号:
          <span class="tk-account-name">{{
            crawlerManage.account?.username
          }}</span>
        </div>
        <ElDropdown
          trigger="hover"
          popper-class="crawler-setting-dropdown-menu"
        >
          <ElIcon :size="24" class="setting-icon"><Setting /></ElIcon>

          <template #dropdown>
            <div class="dropdown-content">
              <ElDropdownMenu>
                <ElDropdownItem @click="handleSwitchTKAccount">
                  <ElIcon><Switch /></ElIcon>
                  <span>切换TK账号</span>
                </ElDropdownItem>
                <ElDropdownItem @click="handleCopyCookie">
                  <ElIcon><CopyDocument /></ElIcon>
                  <span>复制TK Cookie</span>
                </ElDropdownItem>
                <ElDropdownItem @click="handleClearTKCookie">
                  <ElIcon><SwitchButton /></ElIcon>
                  <span>清除TK Cookie</span>
                </ElDropdownItem>
              </ElDropdownMenu>
            </div>
          </template>
        </ElDropdown>
      </div>
    </div>
    <div class="area-select-container">
      <div class="area-select-label">
        优先地区设置
        <ElTooltip placement="top">
          <template #content>
            <div>采集优先地区</div>
            <div>• 建议与 VPN 地区配置保持一致。实测 VPN 对结果影响更大</div>
            <div>
              •
              注：这个参数的作用是让TK优先推荐所选地区的主播，但并不限于这些地区
            </div>
          </template>
          <ElIcon class="area-select-label-tooltip-icon">
            <InfoFilled />
          </ElIcon>
        </ElTooltip>
      </div>
      <div class="area-select">
        <AreaSelectSingle
          :model-value="crawlArea"
          show-all
          popper-class="crawl-area-select-popper"
          @change="handleCrawlAreaChange"
        />
      </div>
    </div>
    <div class="normal-view-description">TK 账号状态正常，可以继续采集数据</div>
    <ControlButtons
      :is-crawling="crawlerManage.crawlStatus !== CrawlStatus.STOPPED"
      @start="start"
      @stop="stop"
    />
    <div v-if="statistics" class="crawl-statistics">
      <div>
        <span>抓取 feed {{ statistics.feedNumber }} 次</span>
      </div>
      <div>
        <span>更新 {{ statistics.anchorUpdateTimes }} 名主播</span>
      </div>
      <div>
        <span>用时 {{ formatDuration(statistics.duration) }}</span>
      </div>
    </div>
    <div
      v-if="crawlerManage.crawlStatus === CrawlStatus.SUSPENDED"
      class="suspended-status"
    >
      由于连续出现请求错误，疑似触发了TK的反爬虫机制，或发生了网络问题，暂停采集，数分钟后将自动恢复
    </div>
  </div>
</template>

<style lang="scss" scoped>
.normal-view {
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --font-size-base: 1rem;
  --font-size-sm: 14px;
  --select-width: 200px;

  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  .normal-view-header {
    position: relative;
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
    .normal-view-header-right {
      padding-right: var(--spacing-md);
      display: flex;
      column-gap: var(--spacing-xs);
      .tk-account-name {
        font-weight: 600;
        font-size: 17px;
        transition: all 0.3s ease;
        &:hover {
          font-size: 18px;
          color: var(--el-color-primary);
        }
      }
      .setting-icon {
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
      }

      .setting-icon:hover {
        transform: scale(1.2);
      }
    }
  }

  .area-select-container {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .area-select-label {
    display: flex;
    align-items: center;
    width: fit-content;
    font-size: var(--font-size-sm);
    color: var(--el-text-color-regular);
    white-space: nowrap;
    justify-content: flex-end;
    gap: var(--spacing-xs);
  }

  .area-select-label-tooltip-icon {
    cursor: help;
    font-size: var(--font-size-sm);
    color: var(--el-text-color-secondary);
    transition: color 0.2s ease;
  }

  .area-select-label-tooltip-icon:hover {
    color: var(--el-text-color-primary);
  }

  .area-select {
    width: var(--select-width);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .normal-view-description {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-base);
    color: var(--el-text-color-regular);
    text-align: center;
  }

  .suspended-status {
    margin-top: var(--spacing-xl);
    font-size: var(--font-size-base);
    color: var(--el-color-danger);
    text-align: center;
    max-width: calc(var(--select-width) + var(--label-width));
    line-height: 1.5;
  }
  .crawl-statistics {
    margin-top: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
}
.crawler-setting-dropdown-menu {
  :global(.el-popper__arrow) {
    display: none !important;
  }
  :global(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  :global(.el-dropdown-menu__item:hover) {
    background-color: var(--el-dropdown-menuItem-hover-fill);
    color: var(--el-color-primary);
  }

  :global(.el-dropdown-menu__item .el-icon) {
    font-size: 16px;
    margin-right: 4px;
  }
}
.crawl-area-select-popper {
  :global(.el-select-dropdown) {
    max-height: 210px !important;
  }
  :global(.el-select-dropdown .el-select-dropdown__wrap) {
    max-height: 210px !important;
  }
}
</style>
