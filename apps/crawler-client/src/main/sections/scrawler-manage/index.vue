<script setup lang="ts">
import { useGlobalStore } from '../../utils/vue';
import ControlButtons from './control-buttons.vue';
import CookieNotValidView from './cookie-not-valid-view.vue';

defineOptions({
  name: 'ScrawlerManage',
});

const globalStore = useGlobalStore();

async function loginTiktok() {
  await globalStore.loginTiktok();
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
      v-if="!globalStore.isTiktokCookieValid"
      @login-tiktok="loginTiktok"
    />
    <ControlButtons v-else @start="start" @stop="stop" />
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
