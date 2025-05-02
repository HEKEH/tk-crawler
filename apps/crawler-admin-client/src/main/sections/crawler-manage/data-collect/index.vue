<script setup lang="ts">
import type { AnchorCrawledMessage } from '@tk-crawler/biz-shared';
import type { IpcRendererEvent } from 'electron';
import {
  CRAWL_EVENTS,
  CUSTOM_EVENTS,
  IsCookieValidResultStatus,
} from '@tk-crawler-admin-client/shared';
import { REGION_LABEL_MAP, RequestErrorType } from '@tk-crawler/biz-shared';
import { ElectronRenderListeners } from '@tk-crawler/electron-utils/render';
import { MessageQueue, onKeepAliveActivated } from '@tk-crawler/view-shared';
import { computed, onBeforeUnmount, onDeactivated, onMounted } from 'vue';
import { useGlobalStore } from '../../../utils';
import CookieCheckErrorView from './cookie-check-error-view.vue';
import CookieNotValidView from './cookie-not-valid-view.vue';
import NormalView from './normal-view.vue';

defineOptions({
  name: 'DataCollect',
});

const globalStore = useGlobalStore();

const crawlerManage = computed(() => globalStore.crawlerManage);

crawlerManage.value.init();

async function loginTiktok() {
  await crawlerManage.value.loginTiktok();
}

async function retryCheckCookieValid() {
  await crawlerManage.value.recheckTiktokCookieValid();
}

const messageQueue = new MessageQueue({
  messageOffset: 400,
  maxMessages: 6,
});

function handleAnchorCrawled(_: IpcRendererEvent, data: AnchorCrawledMessage) {
  messageQueue.showMessage({
    message: `更新有效主播「${data.anchor.display_id}」(${REGION_LABEL_MAP[data.anchor.region] || data.anchor.region})`,
    type: 'success',
  });
}

// function handleAnchorsCrawledNumber(_: IpcRendererEvent, data: number) {
//   messageQueue.showMessage({
//     message: `爬取到 ${data} 个主播`,
//     type: 'success',
//   });
// }

const electronRenderListeners = ElectronRenderListeners.getInstance();

onMounted(() => {
  electronRenderListeners.on(CRAWL_EVENTS.ANCHOR_UPDATED, handleAnchorCrawled);
});

onBeforeUnmount(() => {
  electronRenderListeners.off(CRAWL_EVENTS.ANCHOR_UPDATED, handleAnchorCrawled);
  messageQueue.destroy();
});

onKeepAliveActivated(() => {
  electronRenderListeners.on(CRAWL_EVENTS.ANCHOR_UPDATED, handleAnchorCrawled);
});

onDeactivated(() => {
  electronRenderListeners.off(CRAWL_EVENTS.ANCHOR_UPDATED, handleAnchorCrawled);
  messageQueue.clearMessages();
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
    v-loading="!crawlerManage.isCookieChecked"
    class="relative w-full h-full flex flex-col items-center"
    element-loading-text="加载中..."
  >
    <template
      v-if="
        crawlerManage.tiktokCookieValidStatus !==
        IsCookieValidResultStatus.STATELESS
      "
    >
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
      <NormalView v-else />
    </template>
  </div>
</template>
