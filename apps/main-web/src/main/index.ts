import { VueQueryPlugin } from '@tanstack/vue-query';
import { vLoading } from 'element-plus';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/global.scss';
import './styles/theme.scss';
import './style.css';

function init() {
  const app = createApp(App);
  app.use(router);
  app.directive('loading', vLoading);
  app.use(VueQueryPlugin);
  app.mount('#app');
}

init();
