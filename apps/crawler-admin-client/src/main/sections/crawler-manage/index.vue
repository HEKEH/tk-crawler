<script setup lang="ts">
import type { AnchorCrawledMessage } from '@tk-crawler/biz-shared';
import type { IpcRendererEvent } from 'electron';
import {
  CUSTOM_EVENTS,
  IsCookieValidResultStatus,
} from '@tk-crawler-admin-client/shared';
import { RequestErrorType } from '@tk-crawler/biz-shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageQueue } from '@tk-crawler/view-shared';
import { onBeforeUnmount, onMounted } from 'vue';
import { useGlobalStore } from '../../utils/vue';
import ControlButtons from './control-buttons.vue';
import CookieCheckErrorView from './cookie-check-error-view.vue';
import CookieNotValidView from './cookie-not-valid-view.vue';

defineOptions({
  name: 'CrawlerManage',
});

const globalStore = useGlobalStore();

const crawlerManage = globalStore.crawlerManage;

async function loginTiktok() {
  await crawlerManage.loginTiktok();
}

async function retryCheckCookieValid() {
  await crawlerManage.checkTiktokCookieValid();
}

async function start() {
  await crawlerManage.start();
}
async function stop() {
  await crawlerManage.stop();
}

const messageQueue = new MessageQueue({
  messageOffset: 200,
});

function handleAnchorCrawled(_: IpcRendererEvent, data: AnchorCrawledMessage) {
  messageQueue.showMessage({
    message: `抓取到主播${data.anchor.display_id}的信息`,
    type: 'success',
  });
}

const electronRenderListeners = ElectronRenderListeners.getInstance();

onMounted(() => {
  electronRenderListeners.on(CUSTOM_EVENTS.ANCHOR_CRAWLED, handleAnchorCrawled);
});

onBeforeUnmount(() => {
  messageQueue.clearMessages();
  electronRenderListeners.off(
    CUSTOM_EVENTS.ANCHOR_CRAWLED,
    handleAnchorCrawled,
  );
});

function handleCrawlRequestError(
  _: IpcRendererEvent,
  errorType: RequestErrorType,
) {
  let message: string;
  if (errorType === RequestErrorType.TIKTOK_REQUEST_ECONNRESET) {
    message =
      '连接失败，请检查网络是否有异常，例如是否开启了VPN，且VPN是否开启了全局代理';
  } else if (errorType === RequestErrorType.TIKTOK_REQUEST_TIMEOUT) {
    message =
      '请求超时，请检查网络是否有异常，例如是否开启了VPN，且VPN是否开启了全局代理';
  } else {
    message = '请求失败，请检查网络是否有异常';
  }
  messageQueue.showMessage({
    message,
    type: 'error',
  });
}

electronRenderListeners.on(
  CUSTOM_EVENTS.CRAWL_REQUEST_ERROR,
  handleCrawlRequestError,
);

onBeforeUnmount(() => {
  electronRenderListeners.off(
    CUSTOM_EVENTS.CRAWL_REQUEST_ERROR,
    handleCrawlRequestError,
  );
});
</script>

<template>
  <div
    v-if="!crawlerManage.isInitialized"
    v-loading="!crawlerManage.isInitialized"
    :style="{ width: '100%', height: '100%', overflow: 'hidden' }"
    element-loading-text="加载中..."
  />
  <div v-else class="crawler-manage">
    <CookieNotValidView
      v-if="
        crawlerManage.tiktokCookieValidStatus ===
        IsCookieValidResultStatus.FAILED
      "
      @login-tiktok="loginTiktok"
    />
    <CookieCheckErrorView
      v-else-if="
        crawlerManage.tiktokCookieValidStatus !==
        IsCookieValidResultStatus.SUCCESS
      "
      :cookie-valid-status="crawlerManage.tiktokCookieValidStatus"
      @retry="retryCheckCookieValid"
    />
    <ControlButtons
      v-else
      :is-crawling="crawlerManage.isCrawling"
      @start="start"
      @stop="stop"
    />
  </div>
</template>

<style scoped>
.crawler-manage {
  padding: 2rem;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
