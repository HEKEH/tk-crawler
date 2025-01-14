import { createApp } from 'vue';

import App from './App.vue';
import { addDefaultCrawlerSettingListener } from './listeners';
import './style.css';

function init() {
  createApp(App).mount('#app');
  addDefaultCrawlerSettingListener();
}

init();
