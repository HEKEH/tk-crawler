import { VueQueryPlugin } from '@tanstack/vue-query';
import { vLoading } from 'element-plus';

import { createApp } from 'vue';
import App from './App.vue';

import './styles/global.scss';
import './styles/theme.scss';
import './style.css';

function init() {
  const app = createApp(App);
  app.directive('loading', vLoading);
  app.use(VueQueryPlugin);
  app.mount('#app');
}

init();
