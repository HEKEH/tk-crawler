import { VueQueryPlugin } from '@tanstack/vue-query';
import { MotionPlugin } from '@vueuse/motion';
import { vLoading } from 'element-plus';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@tk-crawler/styles';
import './style.css';

function init() {
  const app = createApp(App);
  app.use(router);
  app.directive('loading', vLoading);
  app.use(VueQueryPlugin);
  app.use(MotionPlugin);
  app.mount('#app');
}

init();
