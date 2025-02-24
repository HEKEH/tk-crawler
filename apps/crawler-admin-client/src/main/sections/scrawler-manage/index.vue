<script setup lang="ts">
import { IsCookieValidResultStatus } from '@tk-crawler-admin-client/shared';
import { useGlobalStore } from '../../utils/vue';
import ControlButtons from './control-buttons.vue';
import CookieCheckErrorView from './cookie-check-error-view.vue';
import CookieNotValidView from './cookie-not-valid-view.vue';

defineOptions({
  name: 'ScrawlerManage',
});

const globalStore = useGlobalStore();

async function loginTiktok() {
  await globalStore.loginTiktok();
}

async function retryCheckCookieValid() {
  await globalStore.checkTiktokCookieValid();
}

async function start() {
  await globalStore.start();
}
async function stop() {
  await globalStore.stop();
}
</script>

<template>
  <div class="scrawler-manage">
    <CookieNotValidView
      v-if="
        globalStore.tiktokCookieValidStatus === IsCookieValidResultStatus.FAILED
      "
      @login-tiktok="loginTiktok"
    />
    <CookieCheckErrorView
      v-else-if="
        globalStore.tiktokCookieValidStatus !==
        IsCookieValidResultStatus.SUCCESS
      "
      :cookie-valid-status="globalStore.tiktokCookieValidStatus"
      @retry="retryCheckCookieValid"
    />
    <ControlButtons
      v-else
      :is-scrawling="globalStore.isCrawling"
      @start="start"
      @stop="stop"
    />
  </div>
</template>

<style scoped>
.scrawler-manage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
