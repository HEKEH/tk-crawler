import { vLoading } from 'element-plus';
import { createApp } from 'vue';

import App from './App.vue';
import './styles/global.scss';
import './style.css';

function init() {
  const app = createApp(App);
  app.directive('loading', vLoading);
  app.mount('#app');
}

init();
