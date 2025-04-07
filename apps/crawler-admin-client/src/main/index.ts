import { VueQueryPlugin } from '@tanstack/vue-query';
import { vLoading } from 'element-plus';
import { createApp } from 'vue';

import App from './App.vue';
import '@tk-crawler/styles';
import './style.css';

function init() {
  const app = createApp(App);
  app.directive('loading', vLoading);
  app.use(VueQueryPlugin);
  app.mount('#app');
}

init();
